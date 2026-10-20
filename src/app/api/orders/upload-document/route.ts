import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { storage } from "@/lib/storage";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const documentName = formData.get("documentName") as string | null;
    const orderId = formData.get("orderId") as string | null;
    const category = (formData.get("category") as string | null) || "GENERAL";

    if (!file || !documentName) {
      throw new Error("File and documentName are required");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 15MB limit");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error("Unsupported file format. Please upload PDF, JPG, PNG, or DOCX");
    }

    // Get customer profile
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!customerProfile) {
      throw new Error("Customer profile not found");
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to structured vault
    const uploadResult = await storage.uploadFile(
      buffer,
      file.name,
      {
        customerId: customerProfile.id,
        financialYear: "2026-27",
        category,
      },
      file.type
    );

    // Create Document record
    const document = await prisma.document.create({
      data: {
        customerId: customerProfile.id,
        orderId: orderId || null,
        name: documentName,
        fileKey: uploadResult.fileKey,
        fileUrl: uploadResult.fileUrl,
        fileType: file.type,
        fileSize: uploadResult.fileSize,
        financialYear: "2026-27",
        category,
        status: "PENDING_VERIFICATION",
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Document",
      entityId: document.id,
      newValue: { name: document.name, fileKey: document.fileKey, orderId },
    });

    return apiSuccess(document, "Document uploaded successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
