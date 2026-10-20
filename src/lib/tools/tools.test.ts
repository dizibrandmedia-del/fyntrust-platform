import { describe, it, expect } from "vitest";
import {
  calculateGst,
  calculateIncomeTax,
  calculateTds,
  calculateEmi,
  calculateSalary,
  calculateProfitMargin,
  calculateGstInvoice,
  searchHsnSac,
  estimateRegistrationCost,
  assessVirtualCfo,
} from "./calculators";

describe("Phase 7: Free Business Toolkit & Calculators", () => {
  it("should calculate GST correctly for exclusive and inclusive scenarios", () => {
    // Exclusive: 10,000 + 18% = 11,800
    const excl = calculateGst(10000, 18, false);
    expect(excl.taxableAmount).toBe(10000);
    expect(excl.gstAmount).toBe(1800);
    expect(excl.totalAmount).toBe(11800);
    expect(excl.cgst).toBe(900);
    expect(excl.sgst).toBe(900);

    // Inclusive: 11,800 with 18% -> 10,000 taxable + 1,800 GST
    const incl = calculateGst(11800, 18, true);
    expect(incl.taxableAmount).toBe(10000);
    expect(incl.gstAmount).toBe(1800);
    expect(incl.totalAmount).toBe(11800);
  });

  it("should compute Income Tax with FY 2026-27 standard deduction and slabs", () => {
    // Income 7,50,000 under New Regime -> after ₹75k std ded = ₹6,75,000 -> Section 87A rebate applies -> Tax = 0
    const zeroTax = calculateIncomeTax(750000, "NEW");
    expect(zeroTax.totalDeductions).toBe(75000);
    expect(zeroTax.taxableIncome).toBe(675000);
    expect(zeroTax.totalTaxLiability).toBe(0);

    // Income 12,00,000 under New Regime
    const normalTax = calculateIncomeTax(1200000, "NEW");
    expect(normalTax.taxableIncome).toBe(1125000);
    expect(normalTax.totalTaxLiability).toBeGreaterThan(0);
  });

  it("should compute TDS deductions with threshold conditions", () => {
    // 194J Professional (10%, threshold 30,000)
    const belowThreshold = calculateTds(25000, "194J_PROF");
    expect(belowThreshold.isAboveThreshold).toBe(false);
    expect(belowThreshold.tdsAmount).toBe(0);
    expect(belowThreshold.netPayable).toBe(25000);

    const aboveThreshold = calculateTds(50000, "194J_PROF");
    expect(aboveThreshold.isAboveThreshold).toBe(true);
    expect(aboveThreshold.tdsAmount).toBe(5000); // 10% of 50,000
    expect(aboveThreshold.netPayable).toBe(45000);
  });

  it("should calculate business loan EMI accurately", () => {
    // 10,00,000 @ 10% for 12 months
    const emi = calculateEmi(1000000, 10, 12);
    expect(emi.monthlyEmi).toBeGreaterThan(80000);
    expect(emi.totalPayable).toBeGreaterThan(1000000);
    expect(emi.totalInterest).toBe(Number((emi.totalPayable - 1000000).toFixed(2)));
  });

  it("should compute salary CTC breakup and net take-home", () => {
    const salary = calculateSalary(1200000, 50, 40, true);
    expect(salary.monthlyCtc).toBe(100000);
    expect(salary.basicMonthly).toBe(50000);
    expect(salary.netTakeHomeMonthly).toBeGreaterThan(0);
    expect(salary.netTakeHomeMonthly).toBeLessThan(100000);
  });

  it("should calculate business profit margins", () => {
    const margins = calculateProfitMargin(1000000, 600000, 200000, 50000);
    expect(margins.grossProfit).toBe(400000);
    expect(margins.netProfit).toBe(150000);
    expect(margins.grossMargin).toBe(40);
    expect(margins.netMargin).toBe(15);
  });

  it("should search HSN and SAC codes reliably", () => {
    const searchRes = searchHsnSac("Accounting");
    expect(searchRes.length).toBeGreaterThanOrEqual(1);
    expect(searchRes[0].code).toBe("9982");
    expect(searchRes[0].type).toBe("SAC");
  });

  it("should estimate business incorporation costs by entity type", () => {
    const pvtLtd = estimateRegistrationCost("PVT_LTD", "Uttar Pradesh", 100000);
    expect(pvtLtd.totalGovtCharges).toBeGreaterThanOrEqual(0);
    expect(pvtLtd.estimatedTotal).toBeGreaterThan(pvtLtd.totalProfessionalWithGst);

    const proprietorship = estimateRegistrationCost("PROPRIETORSHIP");
    expect(proprietorship.totalGovtCharges).toBe(0);
  });

  it("should assess Virtual CFO suitability based on turnover and operational scope", () => {
    const highScale = assessVirtualCfo(600, 60, 1200, ["Cash Flow Visibility", "Board Reporting"]);
    expect(highScale.score).toBeGreaterThanOrEqual(70);
    expect(highScale.recommendationTier).toBe("FULL_VIRTUAL_CFO");
  });
});
