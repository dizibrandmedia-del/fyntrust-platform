import { describe, it, expect } from "vitest";
import { prisma } from "../db/prisma";
import { createOrderInvoice } from "./index";
import { generateInvoiceHtml } from "./pdf";
import { generateNextInvoiceNumber } from "../orders/pricing";

describe("Phase 3 Invoicing & PDF Generation Engine", () => {
  it("should generate sequential unique invoice numbers", async () => {
    const invNum = await generateNextInvoiceNumber();
    expect(invNum).toMatch(/^FYN\/INV\/\d{4}\/\d{6}$/);
  });

  it("should create invoice linked to order with idempotency", async () => {
    const customer = await prisma.customerProfile.findFirst();
    const service = await prisma.service.findFirst();

    expect(customer).not.toBeNull();
    expect(service).not.toBeNull();
    if (!customer || !service) return;

    // Create a temporary order for invoice test
    const order = await prisma.order.create({
      data: {
        orderNumber: `FYN-TEST-${Date.now()}`,
        customerId: customer.id,
        serviceId: service.id,
        status: "PAYMENT_RECEIVED",
        paymentStatus: "PAID",
        totalAmount: 589,
      },
    });

    const invoice1 = await createOrderInvoice({
      orderId: order.id,
      customerId: customer.id,
      amount: 499,
      taxAmount: 90,
      totalAmount: 589,
      serviceName: service.name,
    });

    expect(invoice1).toBeDefined();
    expect(invoice1.invoiceNumber).toMatch(/^FYN\/INV\/\d{4}\/\d{6}$/);
    expect(invoice1.totalAmount).toBe(589);
    expect(invoice1.status).toBe("PAID");

    // Test Idempotency: Calling again with same orderId should return existing invoice
    const invoice2 = await createOrderInvoice({
      orderId: order.id,
      customerId: customer.id,
      amount: 499,
      taxAmount: 90,
      totalAmount: 589,
      serviceName: service.name,
    });

    expect(invoice2.id).toBe(invoice1.id);
    expect(invoice2.invoiceNumber).toBe(invoice1.invoiceNumber);
  });

  it("should generate printable A4 HTML invoice with GST line items", () => {
    const html = generateInvoiceHtml({
      invoiceNumber: "FYN/INV/2026/000001",
      invoiceDate: "22 Aug 2026",
      orderNumber: "FYN-2026-000001",
      customerName: "Aarav Singhania",
      customerBusinessName: "Aarav Tech Pvt Ltd",
      customerCity: "Lucknow",
      customerState: "Uttar Pradesh",
      customerGstNumber: "09AAACA1234A1Z5",
      lineItems: [
        {
          description: "GST Registration (Standard Plan)",
          sacCode: "998231",
          quantity: 1,
          rate: 499,
          taxableAmount: 499,
          gstRate: 18,
          taxAmount: 90,
          total: 589,
        },
      ],
      subtotal: 499,
      taxAmount: 90,
      totalAmount: 589,
      paymentStatus: "PAID",
      paymentMethod: "UPI (Instant)",
      paymentRef: "pay_test_999",
    });

    expect(html.toUpperCase()).toContain("FYNTRUST");
    expect(html).toContain("FYN/INV/2026/000001");
    expect(html).toContain("Aarav Singhania");
    expect(html).toContain("998231");
    expect(html).toContain("CGST 9%");
    expect(html).toContain("SGST 9%");
    expect(html).toContain("589");
  });
});
