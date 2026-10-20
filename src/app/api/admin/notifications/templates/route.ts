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
    assertPermission(session, "cms:manage");

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { eventType: "asc" },
    });

    return apiSuccess(templates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "cms:manage");

    const body = await req.json();
    const { name, eventType, channel, subject, bodyTemplate, variables } = body;

    if (!name || !eventType || !channel || !bodyTemplate) {
      throw new Error("Missing required notification template fields");
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        eventType,
        channel,
        subject: subject || null,
        bodyTemplate,
        variables: typeof variables === "string" ? variables : JSON.stringify(variables || []),
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Service",
      entityId: template.id,
      newValue: { name, eventType, channel },
    });

    return apiSuccess(template, "Notification template created", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
