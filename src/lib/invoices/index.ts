import { prisma } from "../db/prisma";
import { generateNextInvoiceNumber } from "../orders/pricing";

export interface CreateInvoiceParams {
  orderId: string;
  customerId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  serviceName: string;
  packageName?: string | null;
}

export async function createOrderInvoice(params: CreateInvoiceParams) {
  // Check if invoice already exists for this order (Idempotency)
  const existing = await prisma.invoice.findFirst({
    where: { orderId: params.orderId },
  });

  if (existing) {
    return existing;
  }

  let invoiceNumber = await generateNextInvoiceNumber();
  let attempts = 0;
  while (attempts < 10) {
    const check = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (!check) break;
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const nextSeq = String(((count + attempts + 1) % 999999)).padStart(6, "0");
    invoiceNumber = `FYN/INV/${year}/${nextSeq}`;
    attempts++;
  }

  const lineItems = [
    {
      description: params.packageName
        ? `${params.serviceName} (${params.packageName})`
        : params.serviceName,
      sacCode: "998231", // Legal and Accounting Services SAC code
      quantity: 1,
      rate: params.amount,
      taxableAmount: params.amount,
      gstRate: 18,
      taxAmount: params.taxAmount,
      total: params.totalAmount,
    },
  ];

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: params.orderId,
      customerId: params.customerId,
      amount: params.amount,
      taxAmount: params.taxAmount,
      totalAmount: params.totalAmount,
      status: "PAID",
      invoiceDate: new Date(),
      dueDate: new Date(),
      pdfUrl: `/api/invoices/${invoiceNumber}/download`,
      lineItems: JSON.stringify(lineItems),
    },
  });

  return invoice;
}
