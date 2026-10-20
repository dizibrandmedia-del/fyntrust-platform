import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let expertProfileId = session.expertProfileId;
    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Only assigned experts can access tasks");
      }
    }

    if (!expertProfileId) {
      return apiSuccess([]);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";

    const where: any = { expertId: expertProfileId };
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;

    const tasks = await prisma.expertTask.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            service: { select: { name: true } },
            customer: { select: { businessName: true, user: { select: { fullName: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(tasks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let expertProfileId = session.expertProfileId;
    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Only assigned experts can create tasks");
      }
    }

    const body = await req.json();
    const { orderId, title, description, priority, dueDate } = body;

    if (!orderId || !title) {
      throw new Error("orderId and title are required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");

    assertOrderAccess(session, {
      customerId: order.customerId,
      assignedExpertId: order.assignedExpertId,
    });

    const task = await prisma.expertTask.create({
      data: {
        orderId,
        expertId: expertProfileId!,
        title,
        description: description || null,
        priority: priority || "NORMAL",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
      },
    });

    return apiSuccess(task, "Task created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
