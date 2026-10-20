import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "order:read-all");

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Financials & Payments
    const completedPayments = await prisma.payment.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true, createdAt: true },
    });

    const totalRevenue = completedPayments.reduce((acc, p) => acc + p.amount, 0);
    const todayRevenue = completedPayments
      .filter((p) => p.createdAt >= startOfToday)
      .reduce((acc, p) => acc + p.amount, 0);
    const monthlyRevenue = completedPayments
      .filter((p) => p.createdAt >= startOfMonth)
      .reduce((acc, p) => acc + p.amount, 0);

    // 2. Orders & Pipeline
    const totalOrders = await prisma.order.count();
    const pendingPaymentOrders = await prisma.order.count({
      where: { paymentStatus: "PENDING" },
    });
    const unassignedOrdersList = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        assignedExpertId: null,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: {
        customer: { include: { user: true } },
        service: true,
        documents: true,
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    // 3. Customers & Leads
    const totalCustomers = await prisma.customerProfile.count();
    const totalLeads = await prisma.lead.count();
    const convertedLeads = await prisma.lead.count({ where: { status: "CONVERTED" } });
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // 4. Documents Pending Verification
    const pendingDocumentsCount = await prisma.document.count({
      where: { status: "PENDING_VERIFICATION" },
    });

    // 5. Experts Available
    const availableExperts = await prisma.expertProfile.count({
      where: { availabilityStatus: "AVAILABLE" },
    });

    // 6. Recent Leads
    const recentLeads = await prisma.lead.findMany({
      include: { service: { select: { name: true } }, assignedSales: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 7. Recent Orders
    const recentOrders = await prisma.order.findMany({
      include: {
        customer: { include: { user: true } },
        service: { select: { name: true } },
        assignedExpert: { select: { qualification: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 8. Recent Audit Logs
    const recentAuditLogs = await prisma.auditLog.findMany({
      include: { user: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return apiSuccess({
      kpis: {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        totalOrders,
        pendingPaymentOrders,
        unassignedOrdersCount: unassignedOrdersList.length,
        totalCustomers,
        totalLeads,
        conversionRate,
        pendingDocumentsCount,
        availableExperts,
      },
      unassignedOrders: unassignedOrdersList,
      recentOrders,
      recentLeads,
      recentAuditLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
