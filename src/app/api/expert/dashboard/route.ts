import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    // If Super Admin or Admin is inspecting, find first expert or provide empty
    let expertProfileId = session.expertProfileId;

    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Only registered Chartered Accountants & Experts can access this portal");
      }
    }

    if (!expertProfileId) {
      return apiSuccess({
        kpis: {
          activeAssignments: 0,
          pendingActions: 0,
          documentsAwaitingReview: 0,
          workInProgress: 0,
          completedThisMonth: 0,
          unreadMessagesCount: 0,
        },
        assignedOrders: [],
        pendingTasks: [],
        notifications: [],
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Assigned Orders
    const assignedOrders = await prisma.order.findMany({
      where: { assignedExpertId: expertProfileId },
      include: {
        customer: { select: { businessName: true, city: true, state: true, user: { select: { fullName: true, mobile: true, email: true } } } },
        service: { select: { id: true, name: true, slug: true } },
        package: { select: { name: true, tier: true } },
        documents: true,
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const activeAssignments = assignedOrders.filter(
      (o) => !["COMPLETED", "CANCELLED"].includes(o.status)
    ).length;

    const workInProgress = assignedOrders.filter(
      (o) => o.status === "WORK_IN_PROGRESS" || o.status === "EXPERT_ASSIGNED"
    ).length;

    const completedThisMonth = assignedOrders.filter(
      (o) => o.status === "COMPLETED" && o.completedAt && o.completedAt >= startOfMonth
    ).length;

    // 2. Documents Awaiting Review for Assigned Orders
    const orderIds = assignedOrders.map((o) => o.id);
    const documentsAwaitingReview = await prisma.document.count({
      where: {
        orderId: { in: orderIds },
        status: "PENDING_VERIFICATION",
      },
    });

    // 3. Pending Tasks
    const pendingTasks = await prisma.expertTask.findMany({
      where: {
        expertId: expertProfileId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      include: { order: { select: { orderNumber: true, service: { select: { name: true } } } } },
      orderBy: { dueDate: "asc" },
      take: 6,
    });

    // 4. Notifications
    const notifications = await prisma.customerNotification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return apiSuccess({
      kpis: {
        activeAssignments,
        pendingActions: documentsAwaitingReview + pendingTasks.length,
        documentsAwaitingReview,
        workInProgress,
        completedThisMonth,
        unreadMessagesCount: 0,
      },
      assignedOrders: assignedOrders.slice(0, 8),
      pendingTasks,
      notifications,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
