import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "package:manage");

    const packages = await prisma.servicePackage.findMany({
      include: { service: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(packages);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "package:manage");

    const body = await req.json();
    const { serviceId, name, tier, price, description, features, isPopular } = body;

    if (!serviceId || !name || price === undefined) {
      throw new Error("Missing required package parameters");
    }

    const pkg = await prisma.servicePackage.create({
      data: {
        serviceId,
        name,
        tier: tier || "STARTER",
        price: parseFloat(price),
        description: description || null,
        features: typeof features === "string" ? features : JSON.stringify(features || []),
        isPopular: Boolean(isPopular),
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Package",
      entityId: pkg.id,
      newValue: { name, serviceId, price },
    });

    return apiSuccess(pkg, "Package created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
