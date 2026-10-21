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
  if (/^(DATETIME|TIMESTAMP)/i.test(column.type ?? "") && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().replace("T", " ").replace("Z", "").slice(0, 23);
    }
  }
  if (typeof value === "bigint") return value.toString();
  return value;
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
