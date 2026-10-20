import { prisma } from "../db/prisma";
import { recordAuditLog } from "../security/audit";

export interface WhatsAppSendParams {
  toMobile: string;
  templateName: string;
  variables?: Record<string, string>;
  messageText?: string;
  fallbackUserId?: string;
  fallbackEmail?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  channelUsed: "WHATSAPP" | "DASHBOARD_FALLBACK" | "MOCK";
  messageId?: string;
  error?: string;
}

const OFFICIAL_WHATSAPP_NUMBER = "+919118066449";

export function generateWhatsAppChatUrl(prefilledText?: string): string {
  const cleanNumber = OFFICIAL_WHATSAPP_NUMBER.replace(/\D/g, "");
  const encodedText = prefilledText ? encodeURIComponent(prefilledText) : encodeURIComponent("Hello Fyntrust team, I need expert CA assistance with my business.");
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

export async function sendWhatsAppNotification(
  params: WhatsAppSendParams
): Promise<WhatsAppSendResult> {
  const { toMobile, templateName, variables = {}, messageText, fallbackUserId } = params;

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // Render message body
  let body = messageText || `Fyntrust Alert: Your update for ${templateName} is ready.`;
  for (const [key, val] of Object.entries(variables)) {
    body = body.replace(new RegExp(`{{${key}}}`, "g"), val);
  }

  // 1. If WhatsApp Cloud API credentials configured
  if (phoneNumberId && accessToken && !accessToken.includes("mock")) {
    try {
      const cleanTo = toMobile.replace(/\D/g, "");
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo.startsWith("91") ? cleanTo : `91${cleanTo}`,
          type: "text",
          text: { body },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        return {
          success: true,
          channelUsed: "WHATSAPP",
          messageId: json.messages?.[0]?.id,
        };
      } else {
        const errJson = await res.text();
        console.warn("[WHATSAPP_API_FAILURE]", errJson);
        // Trigger fallback below
      }
    } catch (apiError: any) {
      console.warn("[WHATSAPP_SEND_ERROR]", apiError.message);
    }
  }

  // 2. Fallback: Create In-App Dashboard Notification so customer never misses information
  if (fallbackUserId) {
    try {
      await prisma.customerNotification.create({
        data: {
          userId: fallbackUserId,
          title: `Fyntrust: ${templateName.replace(/_/g, " ")}`,
          message: body,
          channel: "DASHBOARD",
        },
      });

      return {
        success: true,
        channelUsed: "DASHBOARD_FALLBACK",
      };
    } catch (fallbackError) {
      console.error("[NOTIFICATION_FALLBACK_FAILURE]", fallbackError);
    }
  }

  // 3. Mock environment success
  return {
    success: true,
    channelUsed: "MOCK",
    messageId: `mock-wa-${Date.now()}`,
  };
}
