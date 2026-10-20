import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireRole(req, ["SUPER_ADMIN", "ADMIN"]);

    const redirect = await prisma.redirect.delete({
      where: { id: params.id },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "DELETE",
      entity: "Service",
      entityId: params.id,
      oldValue: { sourceUrl: redirect.sourceUrl },
    });

    return apiSuccess({ message: "Redirect deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
