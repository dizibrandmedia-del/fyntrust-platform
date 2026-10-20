import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface BackupResult {
  success: boolean;
  backupPath: string;
  checksum: string;
  sizeBytes: number;
  timestamp: string;
}

export function performDatabaseBackup(
  dbFilePath: string = path.join(process.cwd(), "prisma", "dev.db"),
  backupDir: string = path.join(process.cwd(), "backups", "db")
): BackupResult {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (!fs.existsSync(dbFilePath)) {
    throw new Error(`Database file not found at: ${dbFilePath}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `fyntrust_db_${timestamp}.db`;
  const targetBackupPath = path.join(backupDir, backupFileName);

  // Copy database file
  fs.copyFileSync(dbFilePath, targetBackupPath);

  // Calculate SHA256 checksum for backup integrity verification
  const fileBuffer = fs.readFileSync(targetBackupPath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  const checksum = hashSum.digest("hex");

  const stat = fs.statSync(targetBackupPath);

  // Save metadata
  const metadataPath = path.join(backupDir, `${backupFileName}.meta.json`);
  fs.writeFileSync(
    metadataPath,
    JSON.stringify(
      {
        backupFileName,
        sizeBytes: stat.size,
        checksum,
        timestamp,
        source: dbFilePath,
      },
      null,
      2
    )
  );

  return {
    success: true,
    backupPath: targetBackupPath,
    checksum,
    sizeBytes: stat.size,
    timestamp,
  };
}

export function restoreDatabaseBackup(
  backupFilePath: string,
  targetDbPath: string = path.join(process.cwd(), "prisma", "dev.db")
): boolean {
  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file not found at: ${backupFilePath}`);
  }

  // Verify file readability and copy
  fs.copyFileSync(backupFilePath, targetDbPath);
  return true;
}

// Run standalone if invoked directly
if (require.main === module) {
  try {
    const result = performDatabaseBackup();
    console.log("✓ Database backup completed successfully:", result);
  } catch (err: any) {
    console.error("✗ Backup failed:", err.message);
    process.exit(1);
  }
}
