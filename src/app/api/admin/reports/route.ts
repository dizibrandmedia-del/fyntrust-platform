import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "order:read-all");

    // 1. Orders by Service
    const services = await prisma.service.findMany({
      include: {
        orders: { select: { id: true, totalAmount: true, status: true, paymentStatus: true } },
      },
    });

    const servicePerformance = services.map((s) => {
      const paidOrders = s.orders.filter((o) => o.paymentStatus === "PAID");
      const revenue = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
      return {
        serviceId: s.id,
        serviceName: s.name,
        totalOrders: s.orders.length,
        paidOrders: paidOrders.length,
        revenue,
      };
    });

    // 2. Expert Workload
    const experts = await prisma.expertProfile.findMany({
      include: {
        user: { select: { fullName: true } },
        assignedOrders: { select: { id: true, status: true } },
      },
    });

    const expertWorkload = experts.map((e) => {
      const active = e.assignedOrders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status)).length;
      const completed = e.assignedOrders.filter((o) => o.status === "COMPLETED").length;
      return {
        expertId: e.id,
        expertName: e.user.fullName,
        qualification: e.qualification,
        activeOrders: active,
        completedOrders: completed,
      };
    });

    return apiSuccess({
      servicePerformance,
      expertWorkload,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
