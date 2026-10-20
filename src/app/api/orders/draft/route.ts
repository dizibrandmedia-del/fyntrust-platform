import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { calculateOrderPricing, generateNextOrderNumber } from "@/lib/orders/pricing";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const { serviceId, packageId, businessDetails, requirementData, orderId } = body;

    if (!serviceId) {
      throw new Error("serviceId is required to create an order draft");
    }

    // 1. Ensure customer profile exists or update it
    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!customerProfile) {
      customerProfile = await prisma.customerProfile.create({
        data: {
          userId: session.userId,
          businessName: businessDetails?.businessName || "Registered Business",
          businessType: businessDetails?.businessType || "Private Limited",
          city: businessDetails?.city || "Not Specified",
          state: businessDetails?.state || "Not Specified",
          gstNumber: businessDetails?.gstNumber,
          panNumber: businessDetails?.panNumber,
        },
      });
    } else if (businessDetails) {
      customerProfile = await prisma.customerProfile.update({
        where: { id: customerProfile.id },
        data: {
          businessName: businessDetails.businessName || customerProfile.businessName,
          businessType: businessDetails.businessType || customerProfile.businessType,
          city: businessDetails.city || customerProfile.city,
          state: businessDetails.state || customerProfile.state,
          gstNumber: businessDetails.gstNumber || customerProfile.gstNumber,
          panNumber: businessDetails.panNumber || customerProfile.panNumber,
        },
      });
    }

    // 2. Compute verified pricing on server
    const pricing = await calculateOrderPricing(serviceId, packageId);

    // 3. Create or update order draft
    let order;
    if (orderId) {
      // Update existing draft
      const existing = await prisma.order.findUnique({ where: { id: orderId } });
      if (!existing || existing.customerId !== customerProfile.id) {
        throw new Error("Order not found or access denied");
      }

      order = await prisma.order.update({
        where: { id: orderId },
        data: {
          serviceId,
          packageId: packageId || null,
          requirementData: requirementData ? JSON.stringify(requirementData) : existing.requirementData,
          totalAmount: pricing.totalAmount,
        },
        include: { service: true, package: true },
      });
    } else {
      // Create new draft
      const orderNumber = await generateNextOrderNumber();
      order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customerProfile.id,
          serviceId,
          packageId: packageId || null,
          requirementData: requirementData ? JSON.stringify(requirementData) : null,
          totalAmount: pricing.totalAmount,
          status: "ORDER_PLACED",
          paymentStatus: "PENDING",
        },
        include: { service: true, package: true },
      });

      // Initialize standard order milestone steps
      await prisma.orderStep.createMany({
        data: [
          { orderId: order.id, stepNumber: 1, title: "Order Placed & Payment Verification", status: "PENDING" },
          { orderId: order.id, stepNumber: 2, title: "Document Collection & Verification", status: "PENDING" },
          { orderId: order.id, stepNumber: 3, title: "CA Assignment & Application Drafting", status: "PENDING" },
          { orderId: order.id, stepNumber: 4, title: "Statutory Portal Submission & Scrutiny", status: "PENDING" },
          { orderId: order.id, stepNumber: 5, title: "Filing Completion & Certificate Delivery", status: "PENDING" },
        ],
      });
    }

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: orderId ? "UPDATE" : "CREATE",
      entity: "Order",
      entityId: order.id,
      newValue: { orderNumber: order.orderNumber, totalAmount: order.totalAmount, status: order.status },
    });

    return apiSuccess({
      orderId: order.id,
      orderNumber: order.orderNumber,
      pricing,
      order,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
