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
    assertPermission(session, "service:manage");

    const services = await prisma.service.findMany({
      include: {
        category: true,
        packages: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(services);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "service:manage");

    const body = await req.json();
    const {
      name,
      slug,
      categoryId,
      shortDescription,
      fullDescription,
      startingPrice,
      discountPrice,
      slaDays,
      department,
      whatsIncluded,
      eligibility,
      documentsRequired,
      processSteps,
      faqs,
    } = body;

    if (!name || !slug || !categoryId || !shortDescription) {
      throw new Error("Missing required service parameters");
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        categoryId,
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        startingPrice: startingPrice ? parseFloat(startingPrice) : 0,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        slaDays: slaDays ? parseInt(slaDays) : 3,
        department: department || "TAX",
        whatsIncluded: typeof whatsIncluded === "string" ? whatsIncluded : JSON.stringify(whatsIncluded || []),
        eligibility: typeof eligibility === "string" ? eligibility : JSON.stringify(eligibility || []),
        documentsRequired: typeof documentsRequired === "string" ? documentsRequired : JSON.stringify(documentsRequired || []),
        processSteps: typeof processSteps === "string" ? processSteps : JSON.stringify(processSteps || []),
        faqs: typeof faqs === "string" ? faqs : JSON.stringify(faqs || []),
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Service",
      entityId: service.id,
      newValue: { name, slug, startingPrice },
    });

    return apiSuccess(service, "Service created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
