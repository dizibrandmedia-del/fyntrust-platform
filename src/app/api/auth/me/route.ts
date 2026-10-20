import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        mobile: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        customerProfile: true,
        expertProfile: true,
      },
    });

    return apiSuccess({ user }, "User profile retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}
