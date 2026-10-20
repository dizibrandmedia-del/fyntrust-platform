/**
 * Fyntrust Business Toolkit — Calculation Engine
 * Note: Calculations are for indicative informational purposes only.
 */

// 1. GST Calculator
export function calculateGst(amount: number, rate: number, isInclusive: boolean = false) {
  if (amount <= 0 || rate < 0) {
    return { taxableAmount: 0, gstAmount: 0, totalAmount: 0, cgst: 0, sgst: 0, igst: 0 };
  }

  let taxableAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (isInclusive) {
    totalAmount = amount;
    taxableAmount = Number(((amount * 100) / (100 + rate)).toFixed(2));
    gstAmount = Number((totalAmount - taxableAmount).toFixed(2));
  } else {
    taxableAmount = amount;
    gstAmount = Number(((amount * rate) / 100).toFixed(2));
    totalAmount = Number((taxableAmount + gstAmount).toFixed(2));
  }

  const halfGst = Number((gstAmount / 2).toFixed(2));

  return {
    taxableAmount,
    gstAmount,
    totalAmount,
    cgst: halfGst,
    sgst: halfGst,
    igst: gstAmount,
  };
}

// 2. Income Tax Calculator (FY 2026-27 / AY 2027-28 Indicative)
export function calculateIncomeTax(
  grossIncome: number,
  regime: "NEW" | "OLD" = "NEW",
  deductions: {
    section80C?: number;
    section80D?: number;
    hra?: number;
    homeLoanInterest?: number;
    otherDeductions?: number;
  } = {}
) {
  if (grossIncome <= 0) {
    return { grossIncome: 0, totalDeductions: 0, taxableIncome: 0, taxPayable: 0, cess: 0, totalTaxLiability: 0, effectiveRate: 0 };
  }

  let standardDeduction = 0;
  let totalDeductions = 0;
  let taxableIncome = 0;
  let tax = 0;

  if (regime === "NEW") {
    // New Tax Regime (Section 115BAC - FY 2025-26 / 2026-27)
    standardDeduction = 75000;
    totalDeductions = standardDeduction;
    taxableIncome = Math.max(0, grossIncome - totalDeductions);

    // Slabs:
    // 0 - 3L: Nil
    // 3L - 7L: 5%
    // 7L - 10L: 10%
    // 10L - 12L: 15%
    // 12L - 15L: 20%
    // Above 15L: 30%
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 700000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 400000 * 0.05 + (taxableIncome - 700000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + (taxableIncome - 1000000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (taxableIncome - 1200000) * 0.20;
    } else {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (taxableIncome - 1500000) * 0.30;
    }

    // Section 87A Rebate: if taxable income <= 7,00,000, tax liability is Nil
    if (taxableIncome <= 700000) {
      tax = 0;
    }
  } else {
    // Old Tax Regime
    standardDeduction = 50000;
    const s80c = Math.min(deductions.section80C || 0, 150000);
    const s80d = Math.min(deductions.section80D || 0, 75000);
    const hra = deductions.hra || 0;
    const homeLoan = Math.min(deductions.homeLoanInterest || 0, 200000);
    const other = deductions.otherDeductions || 0;

    totalDeductions = standardDeduction + s80c + s80d + hra + homeLoan + other;
    taxableIncome = Math.max(0, grossIncome - totalDeductions);

    // Old Slabs:
    // 0 - 2.5L: Nil
    // 2.5L - 5L: 5%
    // 5L - 10L: 20%
    // Above 10L: 30%
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 250000 * 0.05 + (taxableIncome - 500000) * 0.20;
    } else {
      tax = 250000 * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
    }

    // Section 87A Rebate in Old Regime (if taxable income <= 5L, rebate up to ₹12,500)
    if (taxableIncome <= 500000) {
      tax = 0;
    }
  }

  // 4% Health and Education Cess
  const cess = Number((tax * 0.04).toFixed(2));
  const totalTaxLiability = Number((tax + cess).toFixed(2));
  const effectiveRate = grossIncome > 0 ? Number(((totalTaxLiability / grossIncome) * 100).toFixed(2)) : 0;

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    taxPayable: Number(tax.toFixed(2)),
    cess,
    totalTaxLiability,
    effectiveRate,
  };
}

// 3. TDS Calculator (Common statutory sections)
export const TDS_SECTIONS = [
  { code: "194C_IND", name: "194C - Contractor (Individual / HUF)", rate: 1.0, threshold: 30000 },
  { code: "194C_OTH", name: "194C - Contractor (Company / Firm)", rate: 2.0, threshold: 30000 },
  { code: "194J_TECH", name: "194J - Technical Fees / Royalty", rate: 2.0, threshold: 30000 },
  { code: "194J_PROF", name: "194J - Professional / Legal Fees", rate: 10.0, threshold: 30000 },
  { code: "194I_RENT_LAND", name: "194I - Rent on Land / Building", rate: 10.0, threshold: 240000 },
  { code: "194I_RENT_PLANT", name: "194I - Rent on Plant & Machinery", rate: 2.0, threshold: 240000 },
  { code: "194H", name: "194H - Commission / Brokerage", rate: 5.0, threshold: 15000 },
  { code: "194Q", name: "194Q - Purchase of Goods (Turnover > 10Cr)", rate: 0.1, threshold: 5000000 },
];

export function calculateTds(amount: number, sectionCode: string) {
  const section = TDS_SECTIONS.find((s) => s.code === sectionCode) || TDS_SECTIONS[0];
  if (amount <= 0) {
    return { amount: 0, sectionName: section.name, rate: section.rate, isAboveThreshold: false, tdsAmount: 0, netPayable: 0 };
  }

  const isAboveThreshold = amount >= section.threshold;
  const tdsAmount = isAboveThreshold ? Number(((amount * section.rate) / 100).toFixed(2)) : 0;
  const netPayable = Number((amount - tdsAmount).toFixed(2));

  return {
    amount,
    sectionName: section.name,
    rate: section.rate,
    threshold: section.threshold,
    isAboveThreshold,
    tdsAmount,
    netPayable,
  };
}

// 4. EMI Calculator
export function calculateEmi(principal: number, annualInterestRate: number, tenureMonths: number) {
  if (principal <= 0 || annualInterestRate <= 0 || tenureMonths <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalPayable: 0, principal: 0 };
  }

  const monthlyRate = annualInterestRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = Number(((principal * monthlyRate * factor) / (factor - 1)).toFixed(2));
  const totalPayable = Number((monthlyEmi * tenureMonths).toFixed(2));
  const totalInterest = Number((totalPayable - principal).toFixed(2));

  return {
    principal,
    monthlyEmi,
    totalInterest,
    totalPayable,
    tenureMonths,
    annualInterestRate,
  };
}

// 5. Salary / CTC Calculator
export function calculateSalary(
  annualCtc: number,
  basicPercent: number = 50,
  hraPercent: number = 40,
  hasPf: boolean = true
) {
  if (annualCtc <= 0) {
    return {
      annualCtc: 0,
      monthlyCtc: 0,
      basicMonthly: 0,
      hraMonthly: 0,
      allowancesMonthly: 0,
      employeePf: 0,
      employerPf: 0,
      professionalTax: 0,
      grossSalaryMonthly: 0,
      netTakeHomeMonthly: 0,
      netTakeHomeAnnual: 0,
    };
  }

  const monthlyCtc = Number((annualCtc / 12).toFixed(2));
  const basicMonthly = Number(((monthlyCtc * basicPercent) / 100).toFixed(2));
  const hraMonthly = Number(((basicMonthly * hraPercent) / 100).toFixed(2));

  // PF calculation (12% of basic, standard statutory cap usually ₹1800 if basic > ₹15000)
  const pfBase = Math.min(basicMonthly, 15000);
  const employerPf = hasPf ? Number((pfBase * 0.12).toFixed(2)) : 0;
  const employeePf = hasPf ? Number((pfBase * 0.12).toFixed(2)) : 0;

  const allowancesMonthly = Math.max(0, Number((monthlyCtc - basicMonthly - hraMonthly - employerPf).toFixed(2)));
  const grossSalaryMonthly = Number((basicMonthly + hraMonthly + allowancesMonthly).toFixed(2));

  const professionalTax = 200; // Standard nominal PT in most states
  const totalMonthlyDeductions = employeePf + professionalTax;
  const netTakeHomeMonthly = Math.max(0, Number((grossSalaryMonthly - totalMonthlyDeductions).toFixed(2)));
  const netTakeHomeAnnual = Number((netTakeHomeMonthly * 12).toFixed(2));

  return {
    annualCtc,
    monthlyCtc,
    basicMonthly,
    hraMonthly,
    allowancesMonthly,
    employeePf,
    employerPf,
    professionalTax,
    grossSalaryMonthly,
    netTakeHomeMonthly,
    netTakeHomeAnnual,
  };
}

// 6. Profit Margin Calculator
export function calculateProfitMargin(
  revenue: number,
  costOfGoods: number,
  operatingExpenses: number = 0,
  otherExpenses: number = 0
) {
  if (revenue <= 0) {
    return { revenue: 0, grossProfit: 0, netProfit: 0, grossMargin: 0, netMargin: 0 };
  }

  const grossProfit = Number((revenue - costOfGoods).toFixed(2));
  const netProfit = Number((grossProfit - operatingExpenses - otherExpenses).toFixed(2));
  const grossMargin = Number(((grossProfit / revenue) * 100).toFixed(2));
  const netMargin = Number(((netProfit / revenue) * 100).toFixed(2));

  return {
    revenue,
    costOfGoods,
    operatingExpenses,
    otherExpenses,
    grossProfit,
    netProfit,
    grossMargin,
    netMargin,
  };
}

// 7. GST Invoice Item Calculator
export interface InvoiceItemInput {
  name: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstRate: number;
}

export function calculateGstInvoice(items: InvoiceItemInput[]) {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTaxable = 0;
  let totalGst = 0;

  const processedItems = items.map((item) => {
    const rawTotal = item.quantity * item.rate;
    const discount = item.discountPercent ? (rawTotal * item.discountPercent) / 100 : 0;
    const taxable = rawTotal - discount;
    const gst = (taxable * item.gstRate) / 100;
    const lineTotal = taxable + gst;

    subtotal += rawTotal;
    totalDiscount += discount;
    totalTaxable += taxable;
    totalGst += gst;

    return {
      ...item,
      rawTotal: Number(rawTotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      taxable: Number(taxable.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      lineTotal: Number(lineTotal.toFixed(2)),
    };
  });

  const grandTotal = Number((totalTaxable + totalGst).toFixed(2));

  return {
    items: processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    totalTaxable: Number(totalTaxable.toFixed(2)),
    totalGst: Number(totalGst.toFixed(2)),
    grandTotal,
  };
}

// 8. HSN / SAC Database
export const HSN_SAC_DIRECTORY = [
  { code: "9982", type: "SAC", name: "Legal and Accounting Services", category: "Legal & Professional", rate: 18 },
  { code: "998222", type: "SAC", name: "Accounting, Auditing and Bookkeeping Services", category: "Financial", rate: 18 },
  { code: "998231", type: "SAC", name: "Tax Consultancy and Preparation Services", category: "Taxation", rate: 18 },
  { code: "998311", type: "SAC", name: "Management Consulting & Virtual CFO Advisory", category: "Consulting", rate: 18 },
  { code: "998313", type: "SAC", name: "Information Technology (IT) Software Consultancy", category: "Technology", rate: 18 },
  { code: "998314", type: "SAC", name: "Information Technology Design & Development", category: "Technology", rate: 18 },
  { code: "8471", type: "HSN", name: "Automatic Data Processing Machines / Computers", category: "Hardware", rate: 18 },
  { code: "8517", type: "HSN", name: "Telephone sets, Smartphones & Transmission Apparatus", category: "Electronics", rate: 18 },
  { code: "4901", type: "HSN", name: "Printed Books, Brochures, Leaflets and Publications", category: "Stationery", rate: 0 },
  { code: "9963", type: "SAC", name: "Accommodation, Food and Beverage Services", category: "Hospitality", rate: 5 },
  { code: "9965", type: "SAC", name: "Goods Transport Agency (GTA) Services", category: "Logistics", rate: 5 },
  { code: "9985", type: "SAC", name: "Support Services / Staffing & Manpower Supply", category: "HR Services", rate: 18 },
];

export function searchHsnSac(query: string, filterType: "ALL" | "HSN" | "SAC" = "ALL") {
  const q = query.trim().toLowerCase();
  return HSN_SAC_DIRECTORY.filter((item) => {
    const matchesType = filterType === "ALL" || item.type === filterType;
    const matchesQuery =
      !q ||
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });
}

// 9. Statutory Due Date Checker
export const STATUTORY_DUE_DATES = [
  { type: "GST_GSTR1", name: "GSTR-1 Monthly Return (Outward Supplies)", day: 11, frequency: "Monthly", penalty: "₹50/day (₹20/day for Nil)" },
  { type: "GST_GSTR3B", name: "GSTR-3B Monthly Return (Summary & Tax Payment)", day: 20, frequency: "Monthly", penalty: "₹50/day + 18% p.a. interest" },
  { type: "GST_GSTR1_QRMP", name: "GSTR-1 QRMP (Quarterly)", day: 13, frequency: "Quarterly", penalty: "₹50/day late fee" },
  { type: "GST_GSTR3B_QRMP", name: "GSTR-3B QRMP (Quarterly)", day: 22, frequency: "Quarterly", penalty: "₹50/day + 18% p.a. interest" },
  { type: "TDS_DEPOSIT", name: "Monthly TDS / TCS Challan Deposit", day: 7, frequency: "Monthly", penalty: "1.5% per month interest" },
  { type: "TDS_RETURN_Q1", name: "TDS Quarterly Return Q1 (24Q / 26Q)", dateFixed: "31st July", frequency: "Quarterly", penalty: "₹200/day late filing fee" },
  { type: "TDS_RETURN_Q2", name: "TDS Quarterly Return Q2 (24Q / 26Q)", dateFixed: "31st October", frequency: "Quarterly", penalty: "₹200/day late filing fee" },
  { type: "TDS_RETURN_Q3", name: "TDS Quarterly Return Q3 (24Q / 26Q)", dateFixed: "31st January", frequency: "Quarterly", penalty: "₹200/day late filing fee" },
  { type: "TDS_RETURN_Q4", name: "TDS Quarterly Return Q4 (24Q / 26Q)", dateFixed: "31st May", frequency: "Quarterly", penalty: "₹200/day late filing fee" },
  { type: "ROC_AOC4", name: "ROC Form AOC-4 (Annual Financial Statements)", dateFixed: "30th October (Within 30 days of AGM)", frequency: "Annual", penalty: "₹100/day per company + officers penalty" },
  { type: "ROC_MGT7", name: "ROC Form MGT-7 (Annual Return)", dateFixed: "29th November (Within 60 days of AGM)", frequency: "Annual", penalty: "₹100/day late fee" },
  { type: "ROC_DIR3KYC", name: "ROC Form DIR-3 KYC (Director Identification KYC)", dateFixed: "30th September", frequency: "Annual", penalty: "₹5,000 one-time late filing penalty" },
  { type: "ADVANCE_TAX_Q1", name: "Advance Tax Instalment 1 (15%)", dateFixed: "15th June", frequency: "Quarterly", penalty: "1% per month interest under 234C" },
  { type: "ADVANCE_TAX_Q2", name: "Advance Tax Instalment 2 (45%)", dateFixed: "15th September", frequency: "Quarterly", penalty: "1% per month interest under 234C" },
  { type: "ADVANCE_TAX_Q3", name: "Advance Tax Instalment 3 (75%)", dateFixed: "15th December", frequency: "Quarterly", penalty: "1% per month interest under 234C" },
  { type: "ADVANCE_TAX_Q4", name: "Advance Tax Instalment 4 (100%)", dateFixed: "15th March", frequency: "Quarterly", penalty: "1% per month interest under 234C" },
  { type: "ITR_NON_AUDIT", name: "Income Tax Return (Individuals / Non-Audit)", dateFixed: "31st July", frequency: "Annual", penalty: "₹5,000 late fee under 234F" },
  { type: "ITR_AUDIT", name: "Income Tax Return (Tax Audit / Corporate)", dateFixed: "31st October", frequency: "Annual", penalty: "₹5,000 late fee under 234F" },
];

export function checkDueDate(categoryFilter?: string) {
  if (!categoryFilter || categoryFilter === "ALL") {
    return STATUTORY_DUE_DATES;
  }
  return STATUTORY_DUE_DATES.filter((d) => d.type.startsWith(categoryFilter));
}

// 10. Business Registration Cost Estimator
export function estimateRegistrationCost(
  businessType: "PVT_LTD" | "LLP" | "OPC" | "PROPRIETORSHIP" | "SECTION_8",
  state: string = "Uttar Pradesh",
  authorizedCapital: number = 100000
) {
  let govtFees = 0;
  let nameApprovalGovt = 1000;
  let stampDuty = 1000;
  let dscCost = 1500;
  let professionalFees = 4999;
  let turnaroundDays = "5 - 7 Working Days";

  switch (businessType) {
    case "PVT_LTD":
      govtFees = authorizedCapital <= 1500000 ? 0 : 2000; // SPICe+ Part B MCA zero fee up to ₹15L capital
      stampDuty = state === "Maharashtra" || state === "Delhi" ? 2000 : 1500;
      dscCost = 1800; // 2 DSCs
      professionalFees = 4999;
      turnaroundDays = "4 - 7 Working Days";
      break;
    case "LLP":
      govtFees = 500;
      stampDuty = 1000;
      dscCost = 1800;
      professionalFees = 4499;
      turnaroundDays = "7 - 10 Working Days";
      break;
    case "OPC":
      govtFees = 0;
      stampDuty = 1200;
      dscCost = 900;
      professionalFees = 4499;
      turnaroundDays = "4 - 6 Working Days";
      break;
    case "SECTION_8":
      govtFees = 2000;
      nameApprovalGovt = 1000;
      stampDuty = 2000;
      dscCost = 2700;
      professionalFees = 9999;
      turnaroundDays = "10 - 15 Working Days";
      break;
    case "PROPRIETORSHIP":
      govtFees = 0;
      nameApprovalGovt = 0;
      stampDuty = 0;
      dscCost = 0;
      professionalFees = 1499;
      turnaroundDays = "1 - 2 Working Days";
      break;
  }

  const totalGovtCharges = govtFees + nameApprovalGovt + stampDuty + dscCost;
  const gstOnProfessional = Number((professionalFees * 0.18).toFixed(2));
  const estimatedTotal = totalGovtCharges + professionalFees + gstOnProfessional;

  return {
    businessType,
    state,
    authorizedCapital,
    breakdown: {
      govtFees,
      nameApprovalGovt,
      stampDuty,
      dscCost,
      professionalFees,
      gstOnProfessional,
    },
    totalGovtCharges,
    totalProfessionalWithGst: professionalFees + gstOnProfessional,
    estimatedTotal: Number(estimatedTotal.toFixed(2)),
    turnaroundDays,
  };
}

// 11. Virtual CFO Requirement Assessment
export function assessVirtualCfo(
  annualTurnoverLakhs: number,
  employeeCount: number,
  monthlyTransactions: number,
  challenges: string[] = []
) {
  let score = 0;

  if (annualTurnoverLakhs >= 500) score += 35;
  else if (annualTurnoverLakhs >= 100) score += 25;
  else if (annualTurnoverLakhs >= 25) score += 15;
  else score += 5;

  if (employeeCount >= 50) score += 20;
  else if (employeeCount >= 15) score += 15;
  else if (employeeCount >= 5) score += 10;
  else score += 5;

  if (monthlyTransactions >= 1000) score += 20;
  else if (monthlyTransactions >= 200) score += 15;
  else score += 5;

  score += Math.min(25, challenges.length * 7);

  let recommendationTier = "BASIC_ACCOUNTING";
  let title = "Standard Accounting & Compliance";
  let description = "Your transaction volume is manageable with our standard monthly bookkeeping, GST filing, and TDS retainer services.";

  if (score >= 70) {
    recommendationTier = "FULL_VIRTUAL_CFO";
    title = "Full-Scale Virtual CFO Retainer Recommended";
    description = "Your business has reached high operational complexity. You will gain massive strategic value from our Virtual CFO services including cash flow forecasting, unit economics budgeting, investor reporting, and weekly financial review.";
  } else if (score >= 40) {
    recommendationTier = "GROWTH_CFO";
    title = "Growth-Stage Virtual CFO Advisory";
    description = "Your growing scale calls for specialized monthly MIS reviews, working capital optimization, and proactive tax planning alongside routine accounting.";
  }

  return {
    score: Math.min(100, score),
    recommendationTier,
    title,
    description,
    suggestedServices: [
      "Monthly Virtual CFO Retainer",
      "Cash Flow & Budgeting Forecast",
      "Advanced MIS Reporting",
      "Statutory Compliance Health Check",
    ],
  };
}
