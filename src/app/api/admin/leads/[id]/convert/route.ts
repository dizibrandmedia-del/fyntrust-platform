import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { hashPassword } from "@/lib/auth/password";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "lead:update");

    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) throw new Error("Lead not found");

    // 1. Check if user already exists with matching mobile or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: lead.mobile },
          ...(lead.email ? [{ email: lead.email }] : []),
        ],
      },
      include: { customerProfile: true },
    });

    if (!user) {
      // Create user and customer profile
      const passwordHash = await hashPassword(`Fyn@${lead.mobile.slice(-4)}2026`);
      user = await prisma.user.create({
        data: {
          fullName: lead.name,
          mobile: lead.mobile,
          email: lead.email || `client_${lead.mobile}@fyntrust.in`,
          passwordHash,
          role: "CUSTOMER",
          customerProfile: {
            create: {
              businessName: lead.businessName || "Registered Enterprise",
              businessType: lead.businessType || "Private Limited",
              city: lead.city || "Lucknow",
              state: "Uttar Pradesh",
            },
          },
        },
        include: { customerProfile: true },
      });
    } else if (!user.customerProfile) {
      // Create customer profile if user exists without one
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
          businessName: lead.businessName || "Registered Enterprise",
          businessType: lead.businessType || "Private Limited",
          city: lead.city || "Lucknow",
          state: "Uttar Pradesh",
        },
      });
    }

    // 2. Update Lead status to CONVERTED
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "CONVERTED" },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Lead",
      entityId: lead.id,
      newValue: { status: "CONVERTED", convertedUserId: user.id },
    });

    return apiSuccess(user, "Lead converted to Customer successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
