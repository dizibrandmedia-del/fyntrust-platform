import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["SUPER_ADMIN", "ADMIN"]);

    // 1. Core KPIs
    const totalEvents = await prisma.analyticsEvent.count();
    const pageViews = await prisma.analyticsEvent.count({ where: { eventName: "PAGE_VIEW" } });
    const totalLeads = await prisma.lead.count();
    const totalOrders = await prisma.order.count();
    const paidOrders = await prisma.order.count({ where: { paymentStatus: "PAID" } });

    const revenueResult = await prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    const conversionRate = totalLeads > 0 ? Number(((paidOrders / totalLeads) * 100).toFixed(1)) : 0;

    // 2. Lead Sources Breakdown
    const leadsBySource = await prisma.lead.groupBy({
      by: ["source"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    // 3. Top Services by Orders
    const ordersByService = await prisma.order.groupBy({
      by: ["serviceId"],
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const serviceIds = ordersByService.map((o) => o.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, slug: true },
    });

    const topServices = ordersByService.map((item) => {
      const srv = services.find((s) => s.id === item.serviceId);
      return {
        serviceId: item.serviceId,
        name: srv?.name || "Other Service",
        slug: srv?.slug || "",
        ordersCount: item._count.id,
        revenue: item._sum.totalAmount || 0,
      };
    });

    // 4. UTM Campaigns
    const topCampaigns = await prisma.analyticsEvent.groupBy({
      by: ["utmCampaign", "utmSource"],
      where: { utmCampaign: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    return apiSuccess({
      metrics: {
        totalVisitors: pageViews || totalEvents || 0,
        totalLeads,
        totalOrders,
        paidOrders,
        totalRevenue,
        conversionRate,
      },
      leadsBySource: leadsBySource.map((s) => ({
        source: s.source,
        count: s._count.id,
      })),
      topServices,
      topCampaigns: topCampaigns.map((c) => ({
        campaign: c.utmCampaign,
        source: c.utmSource || "DIRECT",
        eventCount: c._count.id,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
