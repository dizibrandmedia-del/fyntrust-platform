import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";
import {
  generateCycleInvoice,
  processCyclePayment,
  updateRecurringServiceStatus,
} from "@/lib/recurring/recurring-engine";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    const allowed = ["SUPER_ADMIN", "ADMIN", "SALES"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const service = await prisma.recurringService.findUnique({
      where: { id: params.id },
      include: {
        customer: { include: { user: true } },
        service: true,
        package: true,
        assignedExpert: { include: { user: true } },
        billingCycles: {
          orderBy: { cycleNumber: "desc" },
        },
      },
    });

    if (!service) throw new Error("Recurring service not found");

    return apiSuccess(service);
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
    const allowed = ["SUPER_ADMIN", "ADMIN"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const body = await req.json();
    const { action, cycleNumber, cycleId, status } = body;

    if (action === "CHANGE_STATUS" && status) {
      const updated = await updateRecurringServiceStatus(params.id, status, session.userId);
      return apiSuccess(updated, `Recurring service status changed to ${status}`);
    }

    if (action === "GENERATE_INVOICE" && cycleNumber) {
      const invoice = await generateCycleInvoice(params.id, parseInt(cycleNumber));
      return apiSuccess(invoice, "Invoice generated for billing cycle successfully");
    }

    if (action === "MARK_CYCLE_PAID" && cycleId) {
      const updated = await processCyclePayment(cycleId);
      return apiSuccess(updated, "Cycle marked as paid and next cycle scheduled");
    }

    throw new Error("Invalid action specified");
  } catch (error) {
    return handleApiError(error);
  }
}
