import { describe, it, expect } from "vitest";
import {
  generateWhatsAppChatUrl,
  sendWhatsAppNotification,
} from "./whatsapp-service";
import { prisma } from "../db/prisma";

describe("Phase 8: WhatsApp Business & Notification Fallback", () => {
  it("should generate proper WhatsApp click-to-chat URL with official number", () => {
    const url = generateWhatsAppChatUrl("Hello Fyntrust, I want to book a CA.");
    expect(url).toContain("https://wa.me/919118066449");
    expect(url).toContain("Hello%20Fyntrust");
  });

  it("should fallback gracefully to in-app dashboard notification if WhatsApp is unavailable", async () => {
    // Create test user with unique email and mobile
    const uniqueMobile = `+9198${Date.now().toString().slice(-8)}`;
    const testUser = await prisma.user.create({
      data: {
        email: `wa_test_${Date.now()}@fyntrust.in`,
        passwordHash: "dummyhash",
        fullName: "Rohan Gupta",
        mobile: uniqueMobile,
        role: "CUSTOMER",
      },
    });

    const result = await sendWhatsAppNotification({
      toMobile: uniqueMobile,
      templateName: "ORDER_COMPLETED",
      variables: { orderNumber: "FYN-8899" },
      fallbackUserId: testUser.id,
      messageText: "Your order FYN-8899 has been successfully completed by your assigned CA.",
    });

    expect(result.success).toBe(true);

    // Verify dashboard notification was created as fallback
    const notification = await prisma.customerNotification.findFirst({
      where: { userId: testUser.id },
    });

    expect(notification).toBeDefined();
    expect(notification?.channel).toBe("DASHBOARD");
    expect(notification?.message).toContain("FYN-8899");
  });
});
