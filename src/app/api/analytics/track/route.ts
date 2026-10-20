import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventName,
      pagePath,
      serviceSlug,
      city,
      leadId,
      orderId,
      userId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      properties,
    } = body;

    if (!eventName || !pagePath) {
      return NextResponse.json({ success: false, error: "Missing eventName or pagePath" }, { status: 400 });
    }

    // Never log passwords, tokens, or sensitive values
    const safeProps = properties ? JSON.stringify(properties) : null;

    const event = await prisma.analyticsEvent.create({
      data: {
        eventName,
        pagePath,
        serviceSlug: serviceSlug || null,
        city: city || null,
        leadId: leadId || null,
        orderId: orderId || null,
        userId: userId || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
        propertiesJson: safeProps,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    // Analytics logging failure should never crash client
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
