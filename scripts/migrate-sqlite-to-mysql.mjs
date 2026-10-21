import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sqlitePath =
  process.env.SQLITE_MIGRATION_PATH ??
  "/home/u468161300/domains/fyntrust.in/hbuilds/config/dev.db";

const modelTables = new Set([
  "User", "CustomerProfile", "ExpertProfile", "ServiceCategory", "Service",
  "ServicePackage", "Order", "OrderStep", "OrderMessage", "Document",
  "Payment", "Invoice", "CreditNote", "ComplianceItem", "Lead", "City",
  "CityServicePage", "SEOPages", "Blog", "ResourceItem", "Review", "Redirect",
  "MarketingAutomationRule", "AnalyticsEvent", "NotificationTemplate",
  "CustomerNotification", "AuditLog", "LoginHistory", "OTPVerification",
  "Quotation", "CompanySetting", "Deliverable", "ExpertTask", "RecurringService",
  "RecurringBillingCycle", "ComplianceRule", "ComplianceRecord",
  "BusinessDiagnostic", "ToolConfig",
]);

function quoteMysql(identifier) {
  return String.fromCharCode(96) + identifier.replaceAll(String.fromCharCode(96), String.fromCharCode(96).repeat(2)) + String.fromCharCode(96);
}

function quoteSqlite(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function normalizeValue(value, column) {
  if (value === null || value === undefined) return null;
  if (/^(DATETIME|TIMESTAMP|DATE)/i.test(column.type ?? "") && typeof value === "string") {
    const parts = value.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})(?:[T ](\\d{2}):(\\d{2}):(\\d{2})(?:\\.(\\d+))?(?:Z|[+-]\\d{2}:?\\d{2})?)?$/);
    if (parts) {
      const year = Number(parts[1]);
      const month = Number(parts[2]);
      const day = Number(parts[3]);
      const maxDay = month >= 1 && month <= 12
        ? new Date(Date.UTC(year, month, 0)).getUTCDate()
        : 0;
      if (year < 1 || day < 1 || day > maxDay) {
        return new Date().toISOString().replace("T", " ").replace("Z", "").slice(0, 23);
      }
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().replace("T", " ").replace("Z", "").slice(0, 23);
    }
    return new Date().toISOString().replace("T", " ").replace("Z", "").slice(0, 23);
  }
  if (typeof value === "bigint") return value.toString();
  return value;
}

async function repairInvalidDateTimes() {
  const columns = await prisma.$queryRawUnsafe(
    "SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND DATA_TYPE IN ('date', 'datetime', 'timestamp')",
  );
  let repaired = 0;
  for (const { tableName, columnName } of columns) {
    const table = quoteMysql(tableName);
    const column = quoteMysql(columnName);
    repaired += await prisma.$executeRawUnsafe(
      `UPDATE ${table} SET ${column} = CURRENT_TIMESTAMP(3) WHERE YEAR(${column}) = 0 OR MONTH(${column}) = 0 OR DAYOFMONTH(${column}) = 0 OR ${column} = ?`,
      "2000-01-01 00:00:00.000",
    );
  }
  return repaired;
}

async function main() {
  if (!existsSync(sqlitePath)) {
    throw new Error("The preserved SQLite database file was not found; migration stopped without changing source data.");
  }

  const source = new DatabaseSync(sqlitePath, { readOnly: true });
  const tables = source
    .prepare("SELECT name FROM sqlite_master WHERE type = ? AND name NOT LIKE ? ORDER BY name")
    .all("table", "sqlite_%")
    .map((row) => row.name)
    .filter((name) => modelTables.has(name));

  const repairedDates = await repairInvalidDateTimes();
  if (repairedDates > 0) {
    console.info(`Repaired ${repairedDates} legacy date values during import.`);
  }

  const alreadyImported = await prisma.databaseImport.findUnique({
    where: { id: "sqlite-import-v1" },
  });
  if (alreadyImported) {
    console.info("SQLite data migration was already completed; skipping.");
    source.close();
    await prisma.$disconnect();
    return;
  }

  let copiedRows = 0;
  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
        try {
          for (const table of tables) {
            const columns = source
              .prepare(`PRAGMA table_info(${quoteSqlite(table)})`)
              .all();
            if (columns.length === 0) continue;

            const rows = source
              .prepare(`SELECT * FROM ${quoteSqlite(table)}`)
              .all();
            if (rows.length === 0) continue;

            const columnNames = columns.map((column) => column.name);
            const sql =
              `INSERT INTO ${quoteMysql(table)} (${columnNames.map(quoteMysql).join(", ")}) ` +
              `VALUES (${columnNames.map(() => "?").join(", ")})`;

            for (const row of rows) {
              const values = columns.map((column) =>
                normalizeValue(row[column.name], column),
              );
              await tx.$executeRawUnsafe(sql, ...values);
              copiedRows += 1;
            }
          }

          await tx.databaseImport.create({
            data: {
              id: "sqlite-import-v1",
              source: "preserved Hostinger SQLite snapshot",
              sourceTables: tables.length,
            },
          });
        } finally {
          await tx.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
        }
      },
      { maxWait: 10000, timeout: 120000 },
    );
  } finally {
    source.close();
    await prisma.$disconnect();
  }

  console.info(
    `SQLite migration completed: ${copiedRows} rows copied from ${tables.length} tables.`,
  );
}

main().catch(async (error) => {
  console.error("SQLite to MariaDB migration failed:", error.message);
  await prisma.$disconnect();
  process.exitCode = 1;
});
