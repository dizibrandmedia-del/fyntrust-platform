import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["SUPER_ADMIN", "ADMIN"]);

    const cities = await prisma.city.findMany({
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
      include: {
        _count: { select: { cityServicePages: true } },
      },
    });

    return apiSuccess({ cities });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const {
      name,
      slug,
      state,
      shortDescription,
      serviceAvailability,
      isPopular = false,
      featuredStatus = false,
      status = "ACTIVE",
      localAddress,
      localPhone,
      seoTitle,
      seoDescription,
    } = body;

    if (!name || !slug || !state) {
      throw new Error("City name, slug, and state are required");
    }

    const city = await prisma.city.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        state,
        shortDescription,
        serviceAvailability: serviceAvailability ? JSON.stringify(serviceAvailability) : null,
        isPopular,
        featuredStatus,
        status,
        localAddress,
        localPhone,
        seoTitle,
        seoDescription,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Service",
      entityId: city.id,
      newValue: { name, slug, state },
    });

    return apiSuccess({ city }, "City created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
