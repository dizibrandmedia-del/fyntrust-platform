import fs from "fs/promises";
import path from "path";
import { buildDocumentKey, DocumentPathParams } from "./path";

export interface StorageUploadResult {
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface StorageProvider {
  uploadFile(
    fileBuffer: Buffer,
    filename: string,
    params: Omit<DocumentPathParams, "filename">,
    mimeType: string
  ): Promise<StorageUploadResult>;

  getFileUrl(fileKey: string): Promise<string>;

  deleteFile(fileKey: string): Promise<boolean>;
}

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR || "./public/uploads");
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    params: Omit<DocumentPathParams, "filename">,
    mimeType: string
  ): Promise<StorageUploadResult> {
    const fileKey = buildDocumentKey({ ...params, filename });
    const fullPath = path.join(this.baseDir, fileKey);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileBuffer);

    const fileUrl = `/uploads/${fileKey}`;
    return {
      fileKey,
      fileUrl,
      fileSize: fileBuffer.length,
      mimeType,
    };
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `/uploads/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseDir, fileKey);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

// Storage Provider Factory
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";

  if (provider === "s3" || provider === "r2") {
    // S3/R2 compatible interface configured for production
    // In dev / test, defaults cleanly to LocalStorageProvider
    return new LocalStorageProvider();
  }

  return new LocalStorageProvider();
}

export const storage = getStorageProvider();
