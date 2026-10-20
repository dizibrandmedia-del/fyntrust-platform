import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      throw new Error("Customer profile not found");
    }

    return apiSuccess({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
      },
      profile: user.customerProfile,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      throw new Error("Customer profile not found");
    }

    // Permitted fields only
    const {
      fullName,
      businessName,
      businessType,
      city,
      state,
      address,
      gstNumber,
      panNumber,
    } = body;

    // Update User fullName if provided
    if (fullName) {
      await prisma.user.update({
        where: { id: user.id },
        data: { fullName },
      });
    }

    // Update Customer Profile
    const updatedProfile = await prisma.customerProfile.update({
      where: { id: user.customerProfile.id },
      data: {
        businessName: businessName !== undefined ? businessName : user.customerProfile.businessName,
        businessType: businessType !== undefined ? businessType : user.customerProfile.businessType,
        city: city !== undefined ? city : user.customerProfile.city,
        state: state !== undefined ? state : user.customerProfile.state,
        address: address !== undefined ? address : user.customerProfile.address,
        gstNumber: gstNumber !== undefined ? gstNumber : user.customerProfile.gstNumber,
        panNumber: panNumber !== undefined ? panNumber : user.customerProfile.panNumber,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Customer",
      entityId: updatedProfile.id,
      newValue: { businessName, city, state, gstNumber, panNumber },
    });

    return apiSuccess(updatedProfile, "Profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
