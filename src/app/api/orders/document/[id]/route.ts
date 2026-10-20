import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { assertDocumentAccess } from "@/lib/rbac/isolation";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: { order: true },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Verify tenant boundary
    assertDocumentAccess(session, document);

    // Delete file from storage vault
    await storage.deleteFile(document.fileKey);

    // Delete record
    await prisma.document.delete({
      where: { id: params.id },
    });

    return apiSuccess({ deleted: true }, "Document deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
