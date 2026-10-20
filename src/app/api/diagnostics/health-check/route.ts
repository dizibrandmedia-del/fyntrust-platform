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
      turnoverBand,
      profitability,
      cashFlowStatus,
      accountingQuality,
      complianceStatus,
      misFrequency,
    } = body;

    // Calculate Category Health Scores (0 to 100)
    let accountingScore = 70;
    if (accountingQuality === "EXCELLENT_DAILY") accountingScore = 95;
    else if (accountingQuality === "MONTHLY_UPDATED") accountingScore = 80;
    else if (accountingQuality === "BACKLOGGED") accountingScore = 40;
    else accountingScore = 20;

    let cashFlowScore = 70;
    if (cashFlowStatus === "STRONG_SURPLUS") cashFlowScore = 95;
    else if (cashFlowStatus === "STABLE_PREDICTABLE") cashFlowScore = 80;
    else if (cashFlowStatus === "DELAYED_RECEIVABLES") cashFlowScore = 45;
    else cashFlowScore = 30;

    let complianceScore = 70;
    if (complianceStatus === "ALL_FILED_ON_TIME") complianceScore = 95;
    else if (complianceStatus === "MINOR_DELAYS") complianceScore = 65;
    else if (complianceStatus === "NOTICES_PENDING") complianceScore = 35;
    else complianceScore = 50;

    let visibilityScore = 60;
    if (misFrequency === "WEEKLY_DASHBOARD") visibilityScore = 95;
    else if (misFrequency === "MONTHLY_MIS") visibilityScore = 80;
    else if (misFrequency === "YEAR_END_ONLY") visibilityScore = 35;
    else visibilityScore = 20;

    const overallScore = Math.round(
      (accountingScore + cashFlowScore + complianceScore + visibilityScore) / 4
    );

    const improvements: string[] = [];
    const suggestedServices: string[] = [];

    if (accountingScore < 75) {
      improvements.push("Streamline monthly bookkeeping and cloud accounting reconciliations.");
      suggestedServices.push("Monthly Bookkeeping & Accounting Retainer");
    }
    if (cashFlowScore < 75) {
      improvements.push("Implement accounts receivable aging tracking and cash flow forecasting.");
      suggestedServices.push("Virtual CFO Working Capital Advisory");
    }
    if (complianceScore < 75) {
      improvements.push("Eliminate recurring late fees through proactive statutory filing calendars.");
      suggestedServices.push("Comprehensive Annual Compliance Desk");
    }
    if (visibilityScore < 75) {
      improvements.push("Deploy monthly executive MIS dashboards for margin and cost center visibility.");
      suggestedServices.push("Virtual CFO Strategic Financial MIS");
    }

    let leadId = null;

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
            source: "BUSINESS_HEALTH_CHECK",
            status: "NEW_LEAD",
            notes: JSON.stringify({
              overallScore,
              accountingScore,
              cashFlowScore,
              complianceScore,
              visibilityScore,
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
        type: "HEALTH_CHECK",
        businessName: businessName || null,
        businessType: businessType || null,
        city: city || null,
        contactName: contactName || null,
        contactMobile: contactMobile || null,
        contactEmail: contactEmail || null,
        answersJson: JSON.stringify(body),
        score: overallScore,
        summary: `Overall Business Health Index: ${overallScore}/100`,
        leadId,
      },
    });

    return apiSuccess({
      diagnosticId: diagnostic.id,
      overallScore,
      categoryScores: {
        accounting: { label: "Accounting Health", score: accountingScore },
        cashFlow: { label: "Cash Flow Health", score: cashFlowScore },
        compliance: { label: "Compliance Readiness", score: complianceScore },
        visibility: { label: "Financial Visibility", score: visibilityScore },
      },
      improvements,
      suggestedServices: Array.from(new Set(suggestedServices)),
      disclaimer: "This assessment produces an indicative diagnostic for informational review and should not be treated as an audit or professional financial opinion.",
    }, "Health check evaluated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
