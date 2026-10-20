import { prisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/security/audit";

export const DEFAULT_COMPLIANCE_RULES = [
  {
    name: "GSTR-1 Outward Supplies Return",
    code: "GST_GSTR1",
    category: "GST",
    frequency: "MONTHLY",
    applicableBusinessType: "ALL",
    dayOfMonthDue: 11,
    statutoryPenalty: "₹50/day late fee",
    requiredDocuments: JSON.stringify(["Monthly Sales Invoices", "Credit/Debit Notes"]),
    reminderDaysBefore: JSON.stringify([7, 3, 1]),
  },
  {
    name: "GSTR-3B Monthly Summary & Tax Payment",
    code: "GST_GSTR3B",
    category: "GST",
    frequency: "MONTHLY",
    applicableBusinessType: "ALL",
    dayOfMonthDue: 20,
    statutoryPenalty: "₹50/day late fee + 18% p.a. interest on unpaid tax",
    requiredDocuments: JSON.stringify(["Sales Summary", "Purchase Invoices / 2B Reconciliation"]),
    reminderDaysBefore: JSON.stringify([7, 3, 1]),
  },
  {
    name: "TDS / TCS Monthly Deposit",
    code: "TDS_MONTHLY_DEPOSIT",
    category: "TDS",
    frequency: "MONTHLY",
    applicableBusinessType: "ALL",
    dayOfMonthDue: 7,
    statutoryPenalty: "1.5% per month interest under Section 201(1A)",
    requiredDocuments: JSON.stringify(["Vendor Payment Vouchers", "Salary Register"]),
    reminderDaysBefore: JSON.stringify([5, 2, 1]),
  },
  {
    name: "TDS Quarterly Return (Form 24Q / 26Q)",
    code: "TDS_QUARTERLY_RETURN",
    category: "TDS",
    frequency: "QUARTERLY",
    applicableBusinessType: "ALL",
    monthOfQuarterDue: 1, // End of next month
    statutoryPenalty: "₹200/day late filing fee under Section 234E",
    requiredDocuments: JSON.stringify(["Challan BSR Codes", "PAN Mappings"]),
    reminderDaysBefore: JSON.stringify([15, 7, 3, 1]),
  },
  {
    name: "ROC Form DIR-3 KYC Annual Director Verification",
    code: "ROC_DIR3KYC",
    category: "ROC_MCA",
    frequency: "ANNUAL",
    statutoryPenalty: "₹5,000 one-time late filing fee per Director",
    requiredDocuments: JSON.stringify(["Director PAN", "Aadhaar / Passport", "Digital Signature (DSC)"]),
    reminderDaysBefore: JSON.stringify([30, 15, 7, 1]),
  },
  {
    name: "ROC Form AOC-4 Financial Statements Filing",
    code: "ROC_AOC4",
    category: "ROC_MCA",
    frequency: "ANNUAL",
    applicableBusinessType: "PVT_LTD",
    statutoryPenalty: "₹100/day late fee per company without upper cap",
    requiredDocuments: JSON.stringify(["Audited Balance Sheet", "P&L Account", "Directors Report"]),
    reminderDaysBefore: JSON.stringify([30, 15, 7, 1]),
  },
  {
    name: "ROC Form MGT-7 Annual Return",
    code: "ROC_MGT7",
    category: "ROC_MCA",
    frequency: "ANNUAL",
    applicableBusinessType: "PVT_LTD",
    statutoryPenalty: "₹100/day late fee",
    requiredDocuments: JSON.stringify(["Shareholding Pattern", "Board Meeting Dates"]),
    reminderDaysBefore: JSON.stringify([30, 15, 7, 1]),
  },
  {
    name: "Corporate Income Tax Return (ITR-6)",
    code: "ITR_CORP",
    category: "INCOME_TAX",
    frequency: "ANNUAL",
    applicableBusinessType: "PVT_LTD",
    statutoryPenalty: "₹5,000 penalty under Section 234F + interest",
    requiredDocuments: JSON.stringify(["Tax Audit Report (Form 3CD)", "Audited Financials"]),
    reminderDaysBefore: JSON.stringify([30, 15, 7, 1]),
  },
];

/**
 * Seeds default statutory compliance rules if not already seeded
 */
export async function seedDefaultComplianceRules() {
  for (const rule of DEFAULT_COMPLIANCE_RULES) {
    await prisma.complianceRule.upsert({
      where: { code: rule.code },
      update: rule,
      create: rule,
    });
  }
}

/**
 * Generates an individualized compliance calendar for a customer
 */
export async function generateCustomerComplianceCalendar(customerId: string, year: number = 2026) {
  const customer = await prisma.customerProfile.findUnique({
    where: { id: customerId },
  });

  if (!customer) throw new Error("Customer profile not found");

  const rules = await prisma.complianceRule.findMany({
    where: { isActive: true },
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const generated = [];

  for (const rule of rules) {
    // Check business type applicability
    if (
      rule.applicableBusinessType !== "ALL" &&
      customer.businessType &&
      rule.applicableBusinessType !== customer.businessType
    ) {
      continue;
    }

    if (rule.frequency === "MONTHLY" && rule.dayOfMonthDue) {
      for (let m = 0; m < 12; m++) {
        // Due date is in month m+1 for month m return (standard statutory rule)
        const dueMonth = (m + 1) % 12;
        const dueYear = m === 11 ? year + 1 : year;
        const dueDate = new Date(dueYear, dueMonth, rule.dayOfMonthDue);
        const period = `${monthNames[m]} ${year}`;

        // Check if record already exists
        const existing = await prisma.complianceRecord.findFirst({
          where: { customerId, ruleId: rule.id, period },
        });

        if (!existing) {
          const rec = await prisma.complianceRecord.create({
            data: {
              customerId,
              ruleId: rule.id,
              title: `${rule.name} (${period})`,
              category: rule.category,
              period,
              dueDate,
              status: "UPCOMING",
              penaltyRisk: rule.statutoryPenalty,
            },
          });
          generated.push(rec);
        }
      }
    } else if (rule.frequency === "ANNUAL") {
      const period = `FY ${year - 1}-${String(year).slice(2)}`;
      const dueDate = new Date(year, 9, 30); // October 30 standard

      const existing = await prisma.complianceRecord.findFirst({
        where: { customerId, ruleId: rule.id, period },
      });

      if (!existing) {
        const rec = await prisma.complianceRecord.create({
          data: {
            customerId,
            ruleId: rule.id,
            title: `${rule.name} (${period})`,
            category: rule.category,
            period,
            dueDate,
            status: "UPCOMING",
            penaltyRisk: rule.statutoryPenalty,
          },
        });
        generated.push(rec);
      }
    }
  }

  return generated;
}

/**
 * Scans for overdue compliance deadlines and flags them
 */
export async function checkOverdueCompliances() {
  const now = new Date();

  const overdueItems = await prisma.complianceRecord.findMany({
    where: {
      dueDate: { lt: now },
      status: { in: ["UPCOMING", "DUE_SOON", "DOCUMENTS_PENDING"] },
    },
    include: { customer: { include: { user: true } } },
  });

  for (const item of overdueItems) {
    await prisma.complianceRecord.update({
      where: { id: item.id },
      data: { status: "OVERDUE" },
    });

    if (item.customer?.user?.id) {
      await prisma.customerNotification.create({
        data: {
          userId: item.customer.user.id,
          title: `Compliance Overdue: ${item.title}`,
          message: `The statutory due date (${item.dueDate.toLocaleDateString("en-IN")}) has passed. Late fees or penalties may apply. Please complete filing immediately.`,
          linkUrl: `/customer/compliance`,
        },
      });
    }
  }

  return overdueItems.length;
}
