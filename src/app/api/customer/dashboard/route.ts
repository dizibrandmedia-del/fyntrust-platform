import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    // Fetch user and profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      throw new Error("Customer profile not found for authenticated user");
    }

    const customerId = user.customerProfile.id;

    // 1. Fetch Orders
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        service: { select: { id: true, name: true, slug: true, department: true } },
        package: { select: { id: true, name: true, price: true } },
        steps: { orderBy: { stepNumber: "asc" } },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch Documents
    const documents = await prisma.document.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch Payments
    const payments = await prisma.payment.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // 4. Fetch Invoices
    const invoices = await prisma.invoice.findMany({
      where: { customerId },
      orderBy: { invoiceDate: "desc" },
    });

    // 5. Fetch Compliance Items
    const complianceItems = await prisma.complianceItem.findMany({
      where: { customerId },
      orderBy: { dueDate: "asc" },
    });

    // 6. Fetch Notifications
    const notifications = await prisma.customerNotification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 7. Calculate Metrics
    const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
    const activeServicesCount = new Set(activeOrders.map((o) => o.serviceId)).size;
    const pendingDocumentsCount = documents.filter((d) =>
      ["PENDING_UPLOAD", "PENDING_VERIFICATION", "REJECTED"].includes(d.status)
    ).length;
    const pendingPaymentsCount = orders.filter((o) => o.paymentStatus === "PENDING").length;

    // 8. Build High Priority Action Items
    const actionRequired: { id: string; title: string; desc: string; link: string; priority: "HIGH" | "MEDIUM" }[] = [];

    const unpaidOrder = orders.find((o) => o.paymentStatus === "PENDING");
    if (unpaidOrder) {
      actionRequired.push({
        id: `pay-${unpaidOrder.id}`,
        title: `Payment Pending: ${unpaidOrder.service.name}`,
        desc: `Complete payment of ₹${unpaidOrder.totalAmount.toLocaleString("en-IN")} to initiate CA filing.`,
        link: `/customer/orders/${unpaidOrder.id}`,
        priority: "HIGH",
      });
    }

    const pendingDocsOrder = orders.find((o) => o.status === "DOCUMENTS_PENDING" || (o.paymentStatus === "PAID" && o.documents.length === 0));
    if (pendingDocsOrder) {
      actionRequired.push({
        id: `docs-${pendingDocsOrder.id}`,
        title: `Documents Required: ${pendingDocsOrder.service.name}`,
        desc: "Upload required ID and address proofs into your encrypted vault.",
        link: `/customer/documents`,
        priority: "HIGH",
      });
    }

    const upcomingComp = complianceItems.find((c) => c.status === "UPCOMING" || c.status === "DUE_SOON");
    if (upcomingComp) {
      actionRequired.push({
        id: `comp-${upcomingComp.id}`,
        title: `Compliance Due Soon: ${upcomingComp.title}`,
        desc: `Statutory filing due date: ${new Date(upcomingComp.dueDate).toLocaleDateString("en-IN")}`,
        link: `/customer/compliance`,
        priority: "MEDIUM",
      });
    }

    return apiSuccess({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
      },
      customerProfile: user.customerProfile,
      metrics: {
        activeServicesCount,
        activeOrdersCount: activeOrders.length,
        pendingDocumentsCount,
        pendingPaymentsCount,
      },
      actionRequired,
      recentOrders: orders.slice(0, 5),
      recentDocuments: documents.slice(0, 5),
      upcomingCompliance: complianceItems.slice(0, 3),
      recentNotifications: notifications,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
