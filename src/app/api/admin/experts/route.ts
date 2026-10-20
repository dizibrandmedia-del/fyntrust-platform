import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { hashPassword } from "@/lib/auth/password";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "expert:read-all");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const qualification = searchParams.get("qualification") || "";
    const availability = searchParams.get("availability") || "";

    const where: any = {};
    if (qualification && qualification !== "ALL") where.qualification = qualification;
    if (availability && availability !== "ALL") where.availabilityStatus = availability;

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { mobile: { contains: search } } },
        { city: { contains: search } },
        { qualification: { contains: search } },
      ];
    }

    const experts = await prisma.expertProfile.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, mobile: true, role: true, isActive: true } },
        assignedOrders: {
          select: { id: true, orderNumber: true, status: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(experts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "expert:manage");

    const body = await req.json();
    const { fullName, email, mobile, password, qualification, membershipNumber, city, state, experienceYears, role } = body;

    if (!fullName || !email || !mobile || !qualification) {
      throw new Error("Missing required expert registration parameters");
    }

    const passwordHash = await hashPassword(password || "FynExpert@2026");
    const expertRole = role || "CA_FINANCE_EXPERT";

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        mobile,
        passwordHash,
        role: expertRole,
        expertProfile: {
          create: {
            qualification,
            expertise: "Taxation, Corporate Filing, GST & Audit",
            assignedCategories: "tax,gst,accounting,compliance",
            experienceYears: experienceYears ? parseInt(experienceYears) : 5,
            city: city || "Lucknow",
            state: state || "Uttar Pradesh",
            availabilityStatus: "AVAILABLE",
          },
        },
      },
      include: { expertProfile: true },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Expert",
      entityId: user.expertProfile?.id,
      newValue: { fullName, email, qualification },
    });

    return apiSuccess(user, "Expert registered successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
