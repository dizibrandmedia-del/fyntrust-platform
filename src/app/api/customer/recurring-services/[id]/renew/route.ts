import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertCustomerAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { generateNextInvoiceNumber } from "@/lib/orders/pricing";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const recurring = await prisma.recurringService.findUnique({
      where: { id: params.id },
      include: { customer: { include: { user: true } }, service: true },
    });

    if (!recurring) throw new Error("Recurring service not found");

    assertCustomerAccess(session, recurring.customerId);

    // Extend renewal date by 1 year
    const currentRenewal = recurring.renewalDate || new Date();
    const newRenewalDate = new Date(currentRenewal);
    newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);

    const updated = await prisma.recurringService.update({
      where: { id: recurring.id },
      data: {
        renewalDate: newRenewalDate,
        status: "ACTIVE",
        paymentStatus: "PAID",
      },
    });

    // Generate renewal invoice
    const invoiceNumber = await generateNextInvoiceNumber();
    const taxable = recurring.amount - recurring.discount;
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: recurring.orderId || null,
        customerId: recurring.customerId,
        amount: taxable,
        taxAmount: recurring.taxAmount,
        totalAmount: recurring.totalAmount,
        status: "PAID",
        invoiceDate: new Date(),
        lineItems: JSON.stringify([
          {
            description: `${recurring.service.name} — Annual Retainer Renewal`,
            quantity: 1,
            unitPrice: taxable,
            taxableAmount: taxable,
            gstRate: 18,
            gstAmount: recurring.taxAmount,
            totalAmount: recurring.totalAmount,
          },
        ]),
      },
    });

    // Notify customer
    await prisma.customerNotification.create({
      data: {
        userId: recurring.customer.user.id,
        title: `Service Renewal Confirmed: ${recurring.service.name}`,
        message: `Your annual retainer for ${recurring.service.name} has been renewed until ${newRenewalDate.toLocaleDateString("en-IN")}.`,
        linkUrl: `/customer/recurring-services`,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "RecurringService",
      entityId: recurring.id,
      newValue: { renewalDate: newRenewalDate, invoiceId: invoice.id },
    });

    return apiSuccess({ recurring: updated, invoice }, "Service renewed successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
