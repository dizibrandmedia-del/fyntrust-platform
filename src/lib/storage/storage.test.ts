import { describe, it, expect } from "vitest";
import { buildDocumentKey } from "./path";
import { storage } from "./index";

describe("Storage Abstraction & Document Pathing", () => {
  it("should generate structured Client -> FY -> Service document key", () => {
    const key = buildDocumentKey({
      customerId: "cust-1234",
      financialYear: "2026-27",
      category: "GST",
      filename: "gst_certificate.pdf",
    });

    expect(key).toMatch(/^vault\/cust-1234\/2026-27\/GST\/\d+_gst_certificate\.pdf$/);
  });

  it("should upload, retrieve, and delete file in storage provider", async () => {
    const testContent = Buffer.from("Fyntrust Sample Tax Document");
    const result = await storage.uploadFile(
      testContent,
      "sample_tax.pdf",
      {
        customerId: "cust-test",
        financialYear: "2026-27",
        category: "TAX",
      },
      "application/pdf"
    );

    expect(result.fileKey).toBeDefined();
    expect(result.fileUrl).toContain("/uploads/");
    expect(result.fileSize).toBe(testContent.length);

    const url = await storage.getFileUrl(result.fileKey);
    expect(url).toBe(result.fileUrl);

    const deleted = await storage.deleteFile(result.fileKey);
    expect(deleted).toBe(true);
  });
});
