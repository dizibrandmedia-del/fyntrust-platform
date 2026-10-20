import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "document:verify");

    const body = await req.json();
    const { status, rejectionReason } = body;

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: { customer: true, order: true },
    });

    if (!document) throw new Error("Document not found");

    if (status === "REJECTED" && !rejectionReason) {
      throw new Error("A rejectionReason is required when marking document as rejected");
    }

    const updated = await prisma.document.update({
      where: { id: params.id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        verifiedAt: status === "VERIFIED" ? new Date() : null,
      },
    });

    // Notify customer if rejected or verified
    if (document.customer?.userId) {
      await prisma.customerNotification.create({
        data: {
          userId: document.customer.userId,
          title: status === "VERIFIED" ? `Document Verified: ${document.name}` : `Action Required: Document ${document.name} Rejected`,
          message: status === "VERIFIED" ? `Your document "${document.name}" has been reviewed and verified by Fyntrust CA desk.` : `Document rejected: "${rejectionReason}". Please upload a replacement in your document vault.`,
          linkUrl: `/customer/documents`,
        },
      });
    }

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "VERIFY",
      entity: "Document",
      entityId: document.id,
      newValue: { status, rejectionReason },
    });

    return apiSuccess(updated, "Document status updated");
  } catch (error) {
    return handleApiError(error);
  }
}
