import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      throw new Error("Customer profile not found");
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: any = {
      customerId: user.customerProfile.id,
    };

    if (status && status !== "ALL") {
      if (status === "ACTIVE") {
        where.status = { notIn: ["COMPLETED", "CANCELLED"] };
      } else if (status === "PENDING") {
        where.paymentStatus = "PENDING";
      } else {
        where.status = status;
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { service: { name: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, slug: true, department: true } },
        package: { select: { id: true, name: true, price: true } },
        steps: { orderBy: { stepNumber: "asc" } },
        documents: { select: { id: true, name: true, status: true } },
        invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
