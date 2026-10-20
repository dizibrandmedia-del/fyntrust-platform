export type NotificationChannel = "EMAIL" | "WHATSAPP" | "SMS" | "DASHBOARD";

export interface SendNotificationParams {
  eventType:
    | "ORDER_CREATED"
    | "PAYMENT_SUCCESS"
    | "DOCUMENTS_PENDING"
    | "DOCUMENTS_VERIFIED"
    | "EXPERT_ASSIGNED"
    | "STATUS_UPDATE"
    | "RENEWAL_REMINDER"
    | "LEAD_ASSIGNED";
  channel?: NotificationChannel;
  recipient: {
    name: string;
    email?: string | null;
    mobile?: string | null;
    userId?: string | null;
  };
  variables: Record<string, string | number>;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  messageId: string;
  deliveredAt: Date;
}

export function renderTemplate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`;
  });
}

// In-memory record of notifications sent for verification and tests
export const notificationHistory: Array<{
  params: SendNotificationParams;
  renderedBody: string;
  sentAt: Date;
}> = [];

export class NotificationEngine {
  async send(params: SendNotificationParams): Promise<NotificationResult> {
    const channel = params.channel || "EMAIL";
    const templateBody = this.getDefaultTemplate(params.eventType);
    const renderedBody = renderTemplate(templateBody, params.variables);

    notificationHistory.push({
      params,
      renderedBody,
      sentAt: new Date(),
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[NOTIFICATION_SENT] [${channel}] to ${params.recipient.email || params.recipient.mobile}: ${renderedBody}`);
    }

    return {
      success: true,
      channel,
      messageId: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      deliveredAt: new Date(),
    };
  }

  private getDefaultTemplate(eventType: SendNotificationParams["eventType"]): string {
    switch (eventType) {
      case "ORDER_CREATED":
        return "Hello {{customerName}}, your order #{{orderNumber}} for {{serviceName}} has been placed successfully.";
      case "PAYMENT_SUCCESS":
        return "Payment of ₹{{amount}} for order #{{orderNumber}} received successfully. Thank you for choosing Fyntrust.";
      case "EXPERT_ASSIGNED":
        return "A dedicated Fyntrust CA/Expert has been assigned to your order #{{orderNumber}}. We are starting work on your request.";
      case "STATUS_UPDATE":
        return "Your order #{{orderNumber}} status is now updated to: {{status}}.";
      case "DOCUMENTS_PENDING":
        return "Hello {{customerName}}, please upload the pending documents for order #{{orderNumber}} in your Fyntrust client portal.";
      case "RENEWAL_REMINDER":
        return "Reminder: Your recurring compliance service {{serviceName}} is due for renewal on {{dueDate}}.";
      default:
        return "You have a new notification regarding your Fyntrust service.";
    }
  }
}

export const notifications = new NotificationEngine();
