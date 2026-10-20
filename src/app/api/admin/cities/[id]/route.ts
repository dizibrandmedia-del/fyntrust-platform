import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const city = await prisma.city.update({
      where: { id: params.id },
      data: {
        name: body.name,
        state: body.state,
        shortDescription: body.shortDescription,
        serviceAvailability: body.serviceAvailability ? (typeof body.serviceAvailability === "string" ? body.serviceAvailability : JSON.stringify(body.serviceAvailability)) : undefined,
        isPopular: body.isPopular,
        featuredStatus: body.featuredStatus,
        status: body.status,
        localAddress: body.localAddress,
        localPhone: body.localPhone,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        isActive: body.isActive,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "Service",
      entityId: city.id,
      newValue: body,
    });

    return apiSuccess({ city });
  } catch (error) {
    return handleApiError(error);
  }
}
