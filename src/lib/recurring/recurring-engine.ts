import { prisma } from "@/lib/db/prisma";
import { generateNextInvoiceNumber } from "@/lib/orders/pricing";
import { recordAuditLog } from "@/lib/security/audit";

export interface CreateRecurringInput {
  customerId: string;
  serviceId: string;
  packageId?: string;
  assignedExpertId?: string;
  orderId?: string;
  billingFrequency: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY" | "CUSTOM";
  amount: number;
  discount?: number;
  notes?: string;
  startDate?: Date;
  paymentMethod?: string;
}

export async function createRecurringService(input: CreateRecurringInput) {
  const discount = input.discount || 0;
  const taxable = Math.max(0, input.amount - discount);
  const taxAmount = Number((taxable * 0.18).toFixed(2));
  const totalAmount = Number((taxable + taxAmount).toFixed(2));

  const start = input.startDate || new Date();
  const nextBilling = new Date(start);

  // Calculate next billing date based on frequency
  if (input.billingFrequency === "MONTHLY") {
    nextBilling.setMonth(nextBilling.getMonth() + 1);
  } else if (input.billingFrequency === "QUARTERLY") {
    nextBilling.setMonth(nextBilling.getMonth() + 3);
  } else if (input.billingFrequency === "HALF_YEARLY") {
    nextBilling.setMonth(nextBilling.getMonth() + 6);
  } else if (input.billingFrequency === "YEARLY") {
    nextBilling.setFullYear(nextBilling.getFullYear() + 1);
  }

  const renewalDate = new Date(start);
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);

  const recurring = await prisma.recurringService.create({
    data: {
      customerId: input.customerId,
      serviceId: input.serviceId,
      packageId: input.packageId || null,
      assignedExpertId: input.assignedExpertId || null,
      orderId: input.orderId || null,
      billingFrequency: input.billingFrequency,
      amount: input.amount,
      discount,
      taxAmount,
      totalAmount,
      status: "ACTIVE",
      paymentMethod: input.paymentMethod || "PAYMENT_LINK",
      paymentStatus: "PAID",
      startDate: start,
      nextBillingDate: nextBilling,
      nextServiceDate: start,
      renewalDate,
      notes: input.notes || null,
    },
    include: { customer: { include: { user: true } }, service: true },
  });

  // Create Cycle 1
  const cycleEndDate = new Date(start);
  cycleEndDate.setMonth(cycleEndDate.getMonth() + 1);
  cycleEndDate.setDate(cycleEndDate.getDate() - 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const periodLabel = `${monthNames[start.getMonth()]} ${start.getFullYear()}`;

  const cycle = await prisma.recurringBillingCycle.create({
    data: {
      recurringServiceId: recurring.id,
      cycleNumber: 1,
      periodLabel,
      startDate: start,
      endDate: cycleEndDate,
      dueDate: start,
      amount: totalAmount,
      status: "PAID",
    },
  });

  // If expert is assigned, create initial monthly operational task
  if (input.assignedExpertId) {
    // If order exists, link task
    if (input.orderId) {
      await prisma.expertTask.create({
        data: {
          orderId: input.orderId,
          expertId: input.assignedExpertId,
          title: `${recurring.service.name} — ${periodLabel} Execution`,
          description: `Monthly recurring retainer execution for ${recurring.customer.businessName}`,
          priority: "NORMAL",
          dueDate: cycleEndDate,
          status: "PENDING",
        },
      });
    }
  }

  return { recurring, initialCycle: cycle };
}

/**
 * Generates an official Tax Invoice for a recurring cycle.
 * Strictly prevents duplicate invoices for the same cycle.
 */
export async function generateCycleInvoice(recurringServiceId: string, cycleNumber: number) {
  const cycle = await prisma.recurringBillingCycle.findUnique({
    where: {
      recurringServiceId_cycleNumber: { recurringServiceId, cycleNumber },
    },
    include: {
      recurringService: {
        include: {
          customer: { include: { user: true } },
          service: true,
          order: true,
        },
      },
    },
  });

  if (!cycle) {
    throw new Error("Recurring billing cycle not found");
  }

  // Strict Duplicate Invoice Prevention
  if (cycle.invoiceId) {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: cycle.invoiceId },
    });
    if (existingInvoice) {
      return existingInvoice;
    }
  }

  const { recurringService } = cycle;
  const taxable = recurringService.amount - recurringService.discount;
  const taxAmount = recurringService.taxAmount;
  const totalAmount = recurringService.totalAmount;

  const invoiceNumber = await generateNextInvoiceNumber();

  const lineItems = JSON.stringify([
    {
      description: `${recurringService.service.name} — ${cycle.periodLabel} Retainer`,
      quantity: 1,
      unitPrice: taxable,
      taxableAmount: taxable,
      gstRate: 18,
      gstAmount: taxAmount,
      totalAmount,
    },
  ]);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: recurringService.orderId || null,
      customerId: recurringService.customerId,
      amount: taxable,
      taxAmount,
      totalAmount,
      status: "ISSUED",
      invoiceDate: new Date(),
      dueDate: cycle.dueDate,
      lineItems,
    },
  });

  // Link invoice back to billing cycle
  await prisma.recurringBillingCycle.update({
    where: { id: cycle.id },
    data: {
      invoiceId: invoice.id,
      status: "INVOICED",
    },
  });

  // Notify customer
  if (recurringService.customer?.user?.id) {
    await prisma.customerNotification.create({
      data: {
        userId: recurringService.customer.user.id,
        title: `Recurring Invoice Generated: ${invoice.invoiceNumber}`,
        message: `Invoice for ${recurringService.service.name} (${cycle.periodLabel}) is now available in your portal.`,
        linkUrl: `/customer/invoices`,
      },
    });
  }

  return invoice;
}

/**
 * Handle successful cycle payment and schedule next recurring billing cycle
 */
export async function processCyclePayment(cycleId: string, paymentId?: string) {
  const cycle = await prisma.recurringBillingCycle.findUnique({
    where: { id: cycleId },
    include: {
      recurringService: {
        include: { customer: { include: { user: true } }, service: true },
      },
    },
  });

  if (!cycle) throw new Error("Billing cycle not found");

  // Update cycle to PAID
  const updatedCycle = await prisma.recurringBillingCycle.update({
    where: { id: cycleId },
    data: {
      status: "PAID",
      paymentId: paymentId || null,
    },
  });

  // Mark invoice as PAID if attached
  if (cycle.invoiceId) {
    await prisma.invoice.update({
      where: { id: cycle.invoiceId },
      data: { status: "PAID" },
    });
  }

  // Advance next billing date on recurring service
  const currentNextBilling = cycle.recurringService.nextBillingDate || new Date();
  const nextBillingDate = new Date(currentNextBilling);

  if (cycle.recurringService.billingFrequency === "MONTHLY") {
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  } else if (cycle.recurringService.billingFrequency === "QUARTERLY") {
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
  } else {
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
  }

  await prisma.recurringService.update({
    where: { id: cycle.recurringServiceId },
    data: {
      paymentStatus: "PAID",
      status: "ACTIVE",
      nextBillingDate,
    },
  });

  // Automatically spawn the next billing cycle in PENDING state
  const nextCycleNumber = cycle.cycleNumber + 1;
  const nextStart = new Date(cycle.endDate);
  nextStart.setDate(nextStart.getDate() + 1);

  const nextEnd = new Date(nextStart);
  nextEnd.setMonth(nextEnd.getMonth() + 1);
  nextEnd.setDate(nextEnd.getDate() - 1);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const nextPeriodLabel = `${monthNames[nextStart.getMonth()]} ${nextStart.getFullYear()}`;

  await prisma.recurringBillingCycle.create({
    data: {
      recurringServiceId: cycle.recurringServiceId,
      cycleNumber: nextCycleNumber,
      periodLabel: nextPeriodLabel,
      startDate: nextStart,
      endDate: nextEnd,
      dueDate: nextStart,
      amount: cycle.amount,
      status: "PENDING",
    },
  });

  return updatedCycle;
}

/**
 * Safe Pause, Resume, Cancel actions
 */
export async function updateRecurringServiceStatus(
  id: string,
  newStatus: "ACTIVE" | "PAUSED" | "CANCELLED",
  operatorUserId?: string
) {
  const existing = await prisma.recurringService.findUnique({ where: { id } });
  if (!existing) throw new Error("Recurring service not found");

  const updated = await prisma.recurringService.update({
    where: { id },
    data: { status: newStatus },
  });

  if (operatorUserId) {
    await recordAuditLog({
      userId: operatorUserId,
      action: "STATUS_CHANGE",
      entity: "RecurringService",
      entityId: id,
      oldValue: { status: existing.status },
      newValue: { status: newStatus },
    });
  }

  return updated;
}
