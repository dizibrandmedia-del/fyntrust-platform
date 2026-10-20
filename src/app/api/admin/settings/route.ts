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
    assertPermission(session, "settings:manage");

    const settings = await prisma.companySetting.findMany();
    const settingsMap: Record<string, string> = {
      companyName: "Fyntrust Technologies Pvt. Ltd.",
      email: "team@fyntrust.in",
      phone: "+91 9118066449",
      office1: "Alamapati, Ghazipur, UP - 233001",
      office2: "Gomtinagar Extension, Lucknow, UP - 226010",
      gstin: "09AAFCF1234F1Z8",
      orderPrefix: "FYN-2026",
      invoicePrefix: "FYN/INV/2026",
    };

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return apiSuccess(settingsMap);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "settings:manage");

    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await prisma.companySetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "User",
      newValue: { updatedKeys: Object.keys(body) },
    });

    return apiSuccess(body, "Company settings saved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
