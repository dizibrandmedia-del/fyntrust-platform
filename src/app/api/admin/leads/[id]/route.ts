import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "lead:read-all");

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        assignedSales: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    return apiSuccess(lead);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "lead:update");

    const body = await req.json();
    const { status, assignedSalesId, noteText, quoteAmount } = body;

    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) throw new Error("Lead not found");

    let updatedNotes = lead.notes;
    if (noteText) {
      const existing = lead.notes ? JSON.parse(lead.notes) : [];
      existing.push({ text: noteText, addedAt: new Date(), author: session.fullName });
      updatedNotes = JSON.stringify(existing);
    }

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: {
        status: status || lead.status,
        assignedSalesId: assignedSalesId !== undefined ? assignedSalesId : lead.assignedSalesId,
        quoteAmount: quoteAmount !== undefined ? parseFloat(quoteAmount) : lead.quoteAmount,
        notes: updatedNotes,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Lead",
      entityId: lead.id,
      oldValue: { status: lead.status },
      newValue: { status: updated.status, assignedSalesId: updated.assignedSalesId },
    });

    return apiSuccess(updated, "Lead updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
