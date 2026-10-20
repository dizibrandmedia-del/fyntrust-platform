import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";
import { createRecurringService } from "@/lib/recurring/recurring-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const allowed = ["SUPER_ADMIN", "ADMIN", "SALES"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { customer: { businessName: { contains: search } } },
        { customer: { user: { fullName: { contains: search } } } },
        { service: { name: { contains: search } } },
      ];
    }

    const services = await prisma.recurringService.findMany({
      where,
      include: {
        customer: { select: { businessName: true, user: { select: { fullName: true, mobile: true, email: true } } } },
        service: true,
        package: true,
        assignedExpert: { select: { id: true, qualification: true, user: { select: { fullName: true } } } },
        billingCycles: { orderBy: { cycleNumber: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const activeServices = await prisma.recurringService.findMany({
      where: { status: "ACTIVE" },
    });

    let mrr = 0;
    for (const s of activeServices) {
      if (s.billingFrequency === "MONTHLY") mrr += s.totalAmount;
      else if (s.billingFrequency === "QUARTERLY") mrr += s.totalAmount / 3;
      else if (s.billingFrequency === "HALF_YEARLY") mrr += s.totalAmount / 6;
      else if (s.billingFrequency === "YEARLY") mrr += s.totalAmount / 12;
    }

    return apiSuccess({
      services,
      metrics: {
        totalActive: activeServices.length,
        monthlyRecurringRevenue: Number(mrr.toFixed(2)),
        paymentDueCount: services.filter((s) => s.status === "PAYMENT_DUE" || s.paymentStatus === "OVERDUE").length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const allowed = ["SUPER_ADMIN", "ADMIN"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const body = await req.json();
    const result = await createRecurringService(body);

    return apiSuccess(result, "Recurring subscription created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
