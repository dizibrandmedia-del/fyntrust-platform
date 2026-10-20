import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check DB connectivity
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();

    return apiSuccess({
      status: "HEALTHY",
      service: "Fyntrust API",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        users: userCount,
        services: serviceCount,
      },
    }, "Fyntrust service is operational");
  } catch (error) {
    return handleApiError(error);
  }
}
