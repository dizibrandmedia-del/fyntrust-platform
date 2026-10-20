import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const notifications = await prisma.customerNotification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return apiSuccess(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = requireAuth(req);

    await prisma.customerNotification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });

    return apiSuccess(null, "All notifications marked as read");
  } catch (error) {
    return handleApiError(error);
  }
}
