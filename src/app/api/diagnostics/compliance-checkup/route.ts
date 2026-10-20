import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      businessType,
      city,
      contactName,
      contactMobile,
      contactEmail,
      answers,
    } = body;

    // Evaluate answers
    // Categories: GST, ITR, TDS, ROC, Payroll, Accounting
    const reviewAreas: string[] = [];
    const suggestedServices: string[] = [];

    if (answers?.gstFiledMonthly === "NO" || answers?.gstFiledMonthly === "SOMETIMES_LATE") {
      reviewAreas.push("GST Return Timeliness & Input Tax Credit (GSTR-2B) Reconciliation");
      suggestedServices.push("Monthly GST Filing & ITC Reconciliation Retainer");
    }

    if (answers?.advanceTaxCalculated === "NO") {
      reviewAreas.push("Advance Tax Liability Computation to avoid 234B/234C interest penalties");
      suggestedServices.push("Quarterly Advance Tax & Direct Tax Advisory");
    }

    if (answers?.tdsDeductedProperly === "NO" || answers?.tdsReturnsFiled === "NO") {
      reviewAreas.push("TDS Deduction Section 194C/J and Quarterly 24Q/26Q Return Filings");
      suggestedServices.push("TDS Retainer & Quarterly Return Compliance");
    }

    if (businessType === "PVT_LTD" || businessType === "LLP") {
      if (answers?.annualRocFiled === "NO" || answers?.dir3KycCompleted === "NO") {
        reviewAreas.push("MCA / ROC Annual Filings (AOC-4, MGT-7) & Director DIR-3 KYC");
        suggestedServices.push("Annual Corporate ROC Secretarial Retainer");
      }
    }

    if (answers?.monthlyAccountingUpdated === "NO") {
      reviewAreas.push("Up-to-Date Bookkeeping, Bank Reconciliation & Monthly MIS");
      suggestedServices.push("Monthly Accounting & Virtual CFO Services");
    }

    const summary = reviewAreas.length === 0
      ? "Your business compliance framework appears sound and up-to-date across statutory parameters."
      : `Identified ${reviewAreas.length} potential statutory areas to review to prevent late fees, interest, and non-compliance penalties.`;

    let leadId = null;

    // If contact information is provided, create CRM lead
    if (contactMobile && contactName) {
      const existingLead = await prisma.lead.findFirst({
        where: { mobile: contactMobile },
      });

      if (!existingLead) {
        const lead = await prisma.lead.create({
          data: {
            name: contactName,
            mobile: contactMobile,
            email: contactEmail || null,
            city: city || null,
            businessName: businessName || null,
            businessType: businessType || null,
            source: "BUSINESS_COMPLIANCE_CHECKUP",
            status: "NEW_LEAD",
            notes: JSON.stringify({
              checkupType: "COMPLIANCE_CHECKUP",
              reviewAreas,
              suggestedServices,
            }),
          },
        });
        leadId = lead.id;
      } else {
        leadId = existingLead.id;
      }
    }

    const diagnostic = await prisma.businessDiagnostic.create({
      data: {
        type: "COMPLIANCE_CHECKUP",
        businessName: businessName || null,
        businessType: businessType || null,
        city: city || null,
        contactName: contactName || null,
        contactMobile: contactMobile || null,
        contactEmail: contactEmail || null,
        answersJson: JSON.stringify(answers || {}),
        score: Math.max(0, 100 - reviewAreas.length * 18),
        summary,
        leadId,
      },
    });

    return apiSuccess({
      diagnosticId: diagnostic.id,
      score: diagnostic.score,
      summary,
      reviewAreas,
      suggestedServices: Array.from(new Set(suggestedServices)),
      disclaimer: "This checkup provides an indicative overview for informational purposes only and does not constitute formal legal or tax opinion.",
    }, "Compliance checkup evaluated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
