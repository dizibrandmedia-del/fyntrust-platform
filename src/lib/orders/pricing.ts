import { prisma } from "../db/prisma";

export interface PricingBreakdown {
  basePrice: number;
  discountPrice?: number;
  taxAmount: number; // 18% GST
  taxRate: number; // 0.18
  totalAmount: number;
  currency: string;
  isCustomQuote: boolean;
}

export async function calculateOrderPricing(
  serviceId: string,
  packageId?: string | null
): Promise<PricingBreakdown> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { packages: true },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  let basePrice = service.startingPrice;
  let discountPrice = service.discountPrice || undefined;

  if (packageId) {
    const selectedPkg = service.packages.find((p) => p.id === packageId);
    if (selectedPkg) {
      basePrice = selectedPkg.price;
    }
  }

  const isCustomQuote = basePrice <= 0;
  const taxRate = 0.18; // Standard 18% GST for corporate professional services
  const taxAmount = isCustomQuote ? 0 : Math.round(basePrice * taxRate);
  const totalAmount = isCustomQuote ? 0 : basePrice + taxAmount;

  return {
    basePrice,
    discountPrice,
    taxAmount,
    taxRate,
    totalAmount,
    currency: "INR",
    isCustomQuote,
  };
}

export async function generateNextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  const nextSeq = String((count % 999999) + 1).padStart(6, "0");
  return `FYN-${year}-${nextSeq}`;
}

export async function generateNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const nextSeq = String((count % 999999) + 1).padStart(6, "0");
  return `FYN/INV/${year}/${nextSeq}`;
}
