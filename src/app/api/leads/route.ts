import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createLeadSchema } from "@/lib/security/validation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";
import { notifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createLeadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        name: validated.name,
        email: validated.email,
        mobile: validated.mobile,
        city: validated.city,
        businessName: validated.businessName,
        businessType: validated.businessType,
        serviceId: validated.serviceId,
        source: validated.source || "WEBSITE",
        status: "NEW_LEAD",
        notes: validated.notes ? JSON.stringify([{ text: validated.notes, date: new Date().toISOString() }]) : null,
      },
    });

    // Record audit log
    await recordAuditLog({
      action: "CREATE",
      entity: "Lead",
      entityId: lead.id,
      newValue: { name: lead.name, mobile: lead.mobile, city: lead.city, source: lead.source },
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    });

    // Notify sales team
    await notifications.send({
      eventType: "LEAD_ASSIGNED",
      channel: "EMAIL",
      recipient: {
        name: "Fyntrust Sales Team",
        email: "sales@fyntrust.in",
      },
      variables: {
        customerName: lead.name,
        mobile: lead.mobile,
        city: lead.city || "Not Specified",
        orderNumber: lead.id,
      },
    });

    return apiSuccess(
      { leadId: lead.id },
      "Thank you! Your enquiry has been received. A Fyntrust CA/Expert will get in touch with you shortly.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
