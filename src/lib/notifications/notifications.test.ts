import { describe, it, expect } from "vitest";
import { notifications, renderTemplate, notificationHistory } from "./index";

describe("Notification Engine Abstraction", () => {
  it("should render template with variable interpolation", () => {
    const template = "Hello {{customerName}}, your order #{{orderNumber}} for {{serviceName}} is confirmed.";
    const rendered = renderTemplate(template, {
      customerName: "Aarav",
      orderNumber: "FYN-2026-0001",
      serviceName: "GST Registration",
    });

    expect(rendered).toBe("Hello Aarav, your order #FYN-2026-0001 for GST Registration is confirmed.");
  });

  it("should send notification and record delivery history", async () => {
    const initialCount = notificationHistory.length;

    const result = await notifications.send({
      eventType: "ORDER_CREATED",
      channel: "EMAIL",
      recipient: {
        name: "Aarav Singhania",
        email: "client@aaravtech.com",
      },
      variables: {
        customerName: "Aarav",
        orderNumber: "FYN-2026-0001",
        serviceName: "GST Registration",
      },
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(notificationHistory.length).toBe(initialCount + 1);
  });
});
