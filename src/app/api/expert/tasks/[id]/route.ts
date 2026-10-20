import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const task = await prisma.expertTask.findUnique({
      where: { id: params.id },
      include: { order: true },
    });

    if (!task) throw new Error("Task not found");

    assertOrderAccess(session, {
      customerId: task.order.customerId,
      assignedExpertId: task.order.assignedExpertId,
    });

    const body = await req.json();
    const { status, priority, description } = body;

    const updated = await prisma.expertTask.update({
      where: { id: params.id },
      data: {
        status: status || task.status,
        priority: priority || task.priority,
        description: description !== undefined ? description : task.description,
        completedAt: status === "COMPLETED" ? new Date() : task.completedAt,
      },
    });

    return apiSuccess(updated, "Task updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
