import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { createSafeRedirect } from "@/lib/redirects/redirect-engine";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["SUPER_ADMIN", "ADMIN"]);

    const redirects = await prisma.redirect.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return apiSuccess({ redirects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const { sourceUrl, destinationUrl, statusCode = 301 } = body;

    if (!sourceUrl || !destinationUrl) {
      throw new Error("Source URL and Destination URL are required");
    }

    const redirect = await createSafeRedirect(sourceUrl, destinationUrl, Number(statusCode));

    await recordAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Service",
      entityId: redirect.id,
      newValue: { sourceUrl, destinationUrl, statusCode },
    });

    return apiSuccess({ redirect }, "Redirect created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
