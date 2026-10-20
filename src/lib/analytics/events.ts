import { UtmParams, getStoredUtmAttribution } from "../attribution/utm";

export type AnalyticsEventType =
  | "PAGE_VIEW"
  | "SERVICE_VIEW"
  | "GET_STARTED_CLICK"
  | "TALK_TO_EXPERT_CLICK"
  | "LEAD_FORM_START"
  | "LEAD_FORM_SUBMIT"
  | "TOOL_START"
  | "TOOL_COMPLETE"
  | "COMPLIANCE_CHECKUP_START"
  | "COMPLIANCE_CHECKUP_COMPLETE"
  | "HEALTH_CHECK_START"
  | "HEALTH_CHECK_COMPLETE"
  | "ORDER_STARTED"
  | "ORDER_COMPLETED"
  | "PAYMENT_STARTED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "DOCUMENT_UPLOAD"
  | "INVOICE_DOWNLOAD"
  | "WHATSAPP_CLICK"
  | "PHONE_CLICK"
  | "EMAIL_CLICK";

export interface AnalyticsPayload {
  eventName: AnalyticsEventType;
  pagePath?: string;
  serviceSlug?: string;
  city?: string;
  leadId?: string;
  orderId?: string;
  userId?: string;
  properties?: Record<string, any>;
}

// Client-side analytics tracker
export async function trackEvent(payload: AnalyticsPayload): Promise<void> {
  if (typeof window === "undefined") return;

  const pagePath = payload.pagePath || window.location.pathname;
  const utm = getStoredUtmAttribution();

  // Strip any sensitive fields from properties
  const safeProperties = { ...(payload.properties || {}) };
  delete safeProperties.password;
  delete safeProperties.token;
  delete safeProperties.secret;
  delete safeProperties.fileData;

  // 1. Google Analytics 4 (dataLayer / gtag)
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", payload.eventName, {
      page_path: pagePath,
      service_slug: payload.serviceSlug,
      city: payload.city,
      ...safeProperties,
    });
  }

  // 2. Log to internal Analytics API
  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: payload.eventName,
        pagePath,
        serviceSlug: payload.serviceSlug,
        city: payload.city,
        leadId: payload.leadId,
        orderId: payload.orderId,
        userId: payload.userId,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
        utmTerm: utm.utmTerm,
        utmContent: utm.utmContent,
        properties: safeProperties,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    // Non-blocking
  }
}
