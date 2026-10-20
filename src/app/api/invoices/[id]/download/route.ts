import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { generateInvoiceHtml } from "@/lib/invoices/pdf";
import { ForbiddenError, NotFoundError } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    // Support lookup by invoice ID or invoiceNumber
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id: params.id }, { invoiceNumber: params.id }],
      },
      include: {
        order: {
          include: {
            service: true,
            package: true,
            payments: { where: { status: "COMPLETED" } },
          },
        },
        customer: {
          include: { user: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    // Verify tenant boundary
    if (session.role === "CUSTOMER" && invoice.customer.userId !== session.userId) {
      throw new ForbiddenError("You are not authorized to view this invoice");
    }

    const lineItems = invoice.lineItems ? JSON.parse(invoice.lineItems) : [];
    const payment = invoice.order?.payments?.[0];

    const html = generateInvoiceHtml({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      orderNumber: invoice.order?.orderNumber || "RECURRING-RETAINER",
      customerName: invoice.customer.user.fullName,
      customerBusinessName: invoice.customer.businessName,
      customerGstNumber: invoice.customer.gstNumber,
      customerAddress: invoice.customer.address,
      customerCity: invoice.customer.city,
      customerState: invoice.customer.state,
      lineItems,
      subtotal: invoice.amount,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      paymentStatus: invoice.status,
      paymentMethod: payment?.paymentMethod || "Digital Gateway (UPI / Card)",
      paymentRef: payment?.gatewayPaymentId || null,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber.replace(/\//g, "-")}.html"`,
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message || "Failed to generate invoice", {
      status: error.statusCode || 500,
    });
  }
}
