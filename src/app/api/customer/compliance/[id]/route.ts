import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertCustomerAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const record = await prisma.complianceRecord.findUnique({
      where: { id: params.id },
    });

    if (!record) throw new Error("Compliance record not found");

    assertCustomerAccess(session, record.customerId);

    const body = await req.json();
    const { status, notes } = body;

    const updated = await prisma.complianceRecord.update({
      where: { id: params.id },
      data: {
        status: status || record.status,
        notes: notes !== undefined ? notes : record.notes,
        completionDate: status === "COMPLETED" ? new Date() : record.completionDate,
      },
    });

    return apiSuccess(updated, "Compliance status updated");
  } catch (error) {
    return handleApiError(error);
  }
}
