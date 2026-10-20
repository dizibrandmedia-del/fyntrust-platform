import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "service:manage");

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: { category: true, packages: true },
    });

    if (!service) throw new Error("Service not found");

    return apiSuccess(service);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "service:manage");

    const body = await req.json();
    const {
      name,
      shortDescription,
      fullDescription,
      startingPrice,
      discountPrice,
      slaDays,
      department,
      isActive,
      isFeatured,
      whatsIncluded,
      eligibility,
      documentsRequired,
      processSteps,
      faqs,
    } = body;

    const service = await prisma.service.findUnique({ where: { id: params.id } });
    if (!service) throw new Error("Service not found");

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : service.name,
        shortDescription: shortDescription !== undefined ? shortDescription : service.shortDescription,
        fullDescription: fullDescription !== undefined ? fullDescription : service.fullDescription,
        startingPrice: startingPrice !== undefined ? parseFloat(startingPrice) : service.startingPrice,
        discountPrice: discountPrice !== undefined ? parseFloat(discountPrice) : service.discountPrice,
        slaDays: slaDays !== undefined ? parseInt(slaDays) : service.slaDays,
        department: department !== undefined ? department : service.department,
        isActive: isActive !== undefined ? isActive : service.isActive,
        isFeatured: isFeatured !== undefined ? isFeatured : service.isFeatured,
        whatsIncluded: whatsIncluded !== undefined ? (typeof whatsIncluded === "string" ? whatsIncluded : JSON.stringify(whatsIncluded)) : service.whatsIncluded,
        eligibility: eligibility !== undefined ? (typeof eligibility === "string" ? eligibility : JSON.stringify(eligibility)) : service.eligibility,
        documentsRequired: documentsRequired !== undefined ? (typeof documentsRequired === "string" ? documentsRequired : JSON.stringify(documentsRequired)) : service.documentsRequired,
        processSteps: processSteps !== undefined ? (typeof processSteps === "string" ? processSteps : JSON.stringify(processSteps)) : service.processSteps,
        faqs: faqs !== undefined ? (typeof faqs === "string" ? faqs : JSON.stringify(faqs)) : service.faqs,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Service",
      entityId: service.id,
      newValue: { name: updated.name, startingPrice: updated.startingPrice, isActive: updated.isActive },
    });

    return apiSuccess(updated, "Service updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
