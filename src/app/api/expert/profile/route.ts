import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let expertProfileId = session.expertProfileId;
    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Only assigned experts can access profile");
      }
    }

    if (!expertProfileId) {
      throw new Error("Expert profile not found");
    }

    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertProfileId },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobile: true, role: true, isActive: true } },
        _count: { select: { assignedOrders: true } },
      },
    });

    if (!expert) throw new Error("Expert profile not found");

    return apiSuccess(expert);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let expertProfileId = session.expertProfileId;
    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Only assigned experts can update profile");
      }
    }

    if (!expertProfileId) {
      throw new Error("Expert profile not found");
    }

    const body = await req.json();
    const { city, state, availabilityStatus, expertise } = body;

    const allowedAvailability = ["AVAILABLE", "BUSY", "INACTIVE"];
    if (availabilityStatus && !allowedAvailability.includes(availabilityStatus)) {
      throw new Error(`Invalid availabilityStatus: ${availabilityStatus}`);
    }

    const updated = await prisma.expertProfile.update({
      where: { id: expertProfileId },
      data: {
        city: city || undefined,
        state: state || undefined,
        availabilityStatus: availabilityStatus || undefined,
        expertise: expertise || undefined,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Expert",
      entityId: updated.id,
      newValue: { city, state, availabilityStatus },
    });

    return apiSuccess(updated, "Profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
