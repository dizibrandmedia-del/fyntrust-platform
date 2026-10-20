import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";
import { generateCustomerComplianceCalendar, seedDefaultComplianceRules } from "@/lib/compliance/compliance-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const allowed = ["SUPER_ADMIN", "ADMIN"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const body = await req.json();
    const { customerId, year } = body;

    if (!customerId) throw new Error("customerId is required");

    await seedDefaultComplianceRules();
    const generated = await generateCustomerComplianceCalendar(customerId, year || 2026);

    return apiSuccess(generated, `Generated ${generated.length} compliance deadlines for client.`);
  } catch (error) {
    return handleApiError(error);
  }
}
