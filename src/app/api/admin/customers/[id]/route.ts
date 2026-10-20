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
    assertPermission(session, "user:read");

    const customer = await prisma.customerProfile.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobile: true, isActive: true, createdAt: true } },
        orders: {
          include: {
            service: true,
            package: true,
            assignedExpert: { select: { qualification: true, city: true } },
            payments: true,
          },
          orderBy: { createdAt: "desc" },
        },
        documents: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { invoiceDate: "desc" } },
        compliances: { orderBy: { dueDate: "asc" } },
      },
    });

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    return apiSuccess(customer);
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
    assertPermission(session, "user:update");

    const body = await req.json();
    const { businessName, businessType, city, state, address, gstNumber, panNumber, isActive } = body;

    const customer = await prisma.customerProfile.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    // Update Customer Profile
    const updated = await prisma.customerProfile.update({
      where: { id: params.id },
      data: {
        businessName: businessName || customer.businessName,
        businessType: businessType || customer.businessType,
        city: city || customer.city,
        state: state || customer.state,
        address: address !== undefined ? address : customer.address,
        gstNumber: gstNumber !== undefined ? gstNumber : customer.gstNumber,
        panNumber: panNumber !== undefined ? panNumber : customer.panNumber,
      },
    });

    // Update User active state if requested
    if (typeof isActive === "boolean") {
      await prisma.user.update({
        where: { id: customer.userId },
        data: { isActive },
      });
    }

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Customer",
      entityId: customer.id,
      newValue: { businessName, city, state, isActive },
    });

    return apiSuccess(updated, "Customer updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
