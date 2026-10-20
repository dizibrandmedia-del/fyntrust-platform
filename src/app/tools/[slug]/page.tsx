"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  calculateGst,
  calculateIncomeTax,
  calculateTds,
  calculateEmi,
  calculateSalary,
  calculateProfitMargin,
  calculateGstInvoice,
  searchHsnSac,
  checkDueDate,
  estimateRegistrationCost,
  assessVirtualCfo,
  TDS_SECTIONS,
} from "@/lib/tools/calculators";
import {
  ArrowLeft,
  ShieldAlert,
  Percent,
  Calculator,
  Receipt,
  DollarSign,
  TrendingUp,
  Search,
  Calendar,
  Building2,
  Briefcase,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function DynamicToolPage() {
  const { slug } = useParams();

  // --- GST Calculator State ---
  const [gstAmount, setGstAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [isGstInclusive, setIsGstInclusive] = useState<boolean>(false);

  // --- Income Tax State ---
  const [taxIncome, setTaxIncome] = useState<number>(1200000);
  const [taxRegime, setTaxRegime] = useState<"NEW" | "OLD">("NEW");
  const [s80c, setS80c] = useState<number>(150000);
  const [s80d, setS80d] = useState<number>(25000);
  const [hra, setHra] = useState<number>(50000);
  const [homeLoan, setHomeLoan] = useState<number>(0);

  // --- TDS State ---
  const [tdsAmount, setTdsAmount] = useState<number>(50000);
  const [tdsSection, setTdsSection] = useState<string>("194J_PROF");

  // --- EMI State ---
  const [emiPrincipal, setEmiPrincipal] = useState<number>(2000000);
  const [emiRate, setEmiRate] = useState<number>(10.5);
  const [emiTenure, setEmiTenure] = useState<number>(36);

  // --- Salary State ---
  const [salaryCtc, setSalaryCtc] = useState<number>(900000);
  const [basicPct, setBasicPct] = useState<number>(50);
  const [hraPct, setHraPct] = useState<number>(40);

  // --- Profit Margin State ---
  const [profitRev, setProfitRev] = useState<number>(5000000);
  const [profitCogs, setProfitCogs] = useState<number>(3000000);
  const [profitOpex, setProfitOpex] = useState<number>(1000000);

  // --- HSN Search State ---
  const [hsnQuery, setHsnQuery] = useState<string>("");
  const [hsnFilter, setHsnFilter] = useState<"ALL" | "HSN" | "SAC">("ALL");

  // --- Due Date State ---
  const [dueDateCategory, setDueDateCategory] = useState<string>("ALL");

  // --- Registration Estimator State ---
  const [regType, setRegType] = useState<any>("PVT_LTD");
  const [regState, setRegState] = useState<string>("Uttar Pradesh");

  // --- CFO Assessment State ---
  const [cfoTurnover, setCfoTurnover] = useState<number>(150);
  const [cfoEmployees, setCfoEmployees] = useState<number>(12);
  const [cfoTxns, setCfoTxns] = useState<number>(350);
  const [cfoChallenges, setCfoChallenges] = useState<string[]>([
    "Cash Flow Visibility",
    "Statutory Reconciliations",
  ]);

  const toggleCfoChallenge = (ch: string) => {
    if (cfoChallenges.includes(ch)) {
      setCfoChallenges(cfoChallenges.filter((c) => c !== ch));
    } else {
      setCfoChallenges([...cfoChallenges, ch]);
    }
  };

  // Render Tool based on slug
  const renderToolBody = () => {
    switch (slug) {
      case "gst-calculator": {
        const res = calculateGst(gstAmount, gstRate, isGstInclusive);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">GST Parameters</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Base Amount (₹) *</label>
                  <Input
                    type="number"
                    value={gstAmount}
                    onChange={(e) => setGstAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Applicable GST Rate (%)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 12, 18, 28].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setGstRate(rate)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          gstRate === rate ? "bg-[#01574F] text-white" : "bg-white text-fyn-slate border-slate-200"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      checked={!isGstInclusive}
                      onChange={() => setIsGstInclusive(false)}
                    />
                    GST Exclusive (Add GST)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      checked={isGstInclusive}
                      onChange={() => setIsGstInclusive(true)}
                    />
                    GST Inclusive (Extract GST)
                  </label>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4">
              <h2 className="text-base font-bold font-heading text-[#01574F]">GST Breakdown Results</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Taxable Base Value</span>
                  <strong className="text-sm font-heading font-bold text-fyn-slate">₹{res.taxableAmount.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">CGST ({(gstRate / 2)}%)</span>
                  <strong>₹{res.cgst.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">SGST ({(gstRate / 2)}%)</span>
                  <strong>₹{res.sgst.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Total GST Calculated ({gstRate}%)</span>
                  <strong className="text-emerald-800 font-bold">₹{res.gstAmount.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-3 text-sm font-bold text-[#01574F] bg-white p-3 rounded-xl border border-emerald-200">
                  <span>Grand Total (Invoice Value)</span>
                  <span>₹{res.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Card>
          </div>
        );
      }

      case "income-tax-calculator": {
        const res = calculateIncomeTax(taxIncome, taxRegime, {
          section80C: s80c,
          section80D: s80d,
          hra,
          homeLoanInterest: homeLoan,
        });

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">Income & Deductions (FY 2026-27)</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Gross Annual Income (₹) *</label>
                  <Input
                    type="number"
                    value={taxIncome}
                    onChange={(e) => setTaxIncome(Number(e.target.value))}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setTaxRegime("NEW")}
                    className={`flex-1 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      taxRegime === "NEW" ? "bg-[#01574F] text-white" : "bg-white text-fyn-slate border-slate-200"
                    }`}
                  >
                    New Tax Regime (Section 115BAC)
                  </button>
                  <button
                    onClick={() => setTaxRegime("OLD")}
                    className={`flex-1 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      taxRegime === "OLD" ? "bg-[#01574F] text-white" : "bg-white text-fyn-slate border-slate-200"
                    }`}
                  >
                    Old Tax Regime
                  </button>
                </div>

                {taxRegime === "OLD" && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div>
                      <label className="block font-bold text-fyn-slate mb-1">Section 80C (Max ₹1.5L)</label>
                      <Input
                        type="number"
                        value={s80c}
                        onChange={(e) => setS80c(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-fyn-slate mb-1">Section 80D Mediclaim (Max ₹75K)</label>
                      <Input
                        type="number"
                        value={s80d}
                        onChange={(e) => setS80d(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-fyn-slate mb-1">HRA Exemption (₹)</label>
                      <Input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-heading text-[#01574F]">Tax Liability Summary</h2>
                <Badge variant="accent" size="sm">{taxRegime} REGIME</Badge>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Gross Total Income</span>
                  <strong>₹{res.grossIncome.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Total Deductions & Exemptions</span>
                  <strong className="text-emerald-800">- ₹{res.totalDeductions.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Net Taxable Income</span>
                  <strong className="text-fyn-slate font-bold">₹{res.taxableIncome.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Income Tax before Cess</span>
                  <strong>₹{res.taxPayable.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">4% Health & Education Cess</span>
                  <strong>₹{res.cess.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-3 text-base font-bold text-[#01574F] bg-white p-3 rounded-xl border border-emerald-200">
                  <span>Total Tax Liability</span>
                  <span>₹{res.totalTaxLiability.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[11px] text-fyn-slate-muted text-center">
                  Effective Tax Rate: <strong>{res.effectiveRate}%</strong>
                </p>
              </div>
            </Card>
          </div>
        );
      }

      case "tds-calculator": {
        const res = calculateTds(tdsAmount, tdsSection);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">TDS Transaction Details</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Invoice / Payment Amount (₹) *</label>
                  <Input
                    type="number"
                    value={tdsAmount}
                    onChange={(e) => setTdsAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">TDS Statutory Section *</label>
                  <select
                    value={tdsSection}
                    onChange={(e) => setTdsSection(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                  >
                    {TDS_SECTIONS.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.rate}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4">
              <h2 className="text-base font-bold font-heading text-[#01574F]">TDS Deduction Breakdown</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Section & Rate</span>
                  <strong className="text-fyn-slate">{res.sectionName} ({res.rate}%)</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Statutory Threshold</span>
                  <span>₹{(res.threshold ?? 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">TDS Deductible</span>
                  <strong className="text-red-700 font-bold">₹{res.tdsAmount.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-3 text-sm font-bold text-[#01574F] bg-white p-3 rounded-xl border border-emerald-200">
                  <span>Net Payable to Vendor / Payee</span>
                  <span>₹{res.netPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Card>
          </div>
        );
      }

      case "emi-calculator": {
        const res = calculateEmi(emiPrincipal, emiRate, emiTenure);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">Loan Parameters</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Loan Amount (₹) *</label>
                  <Input
                    type="number"
                    value={emiPrincipal}
                    onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Interest Rate (% p.a.) *</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={emiRate}
                    onChange={(e) => setEmiRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Tenure (Months) *</label>
                  <Input
                    type="number"
                    value={emiTenure}
                    onChange={(e) => setEmiTenure(Number(e.target.value))}
                  />
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4">
              <h2 className="text-base font-bold font-heading text-[#01574F]">Repayment Schedule</h2>
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-white rounded-xl border border-emerald-200 text-center space-y-1">
                  <span className="text-xs text-fyn-slate-muted">Monthly EMI</span>
                  <div className="text-2xl font-bold font-heading text-[#01574F]">
                    ₹{res.monthlyEmi.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Principal Amount</span>
                  <strong>₹{res.principal.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Total Interest Payable</span>
                  <strong className="text-amber-800">₹{res.totalInterest.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-fyn-slate">
                  <span>Total Amount Payable</span>
                  <span>₹{res.totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Card>
          </div>
        );
      }

      case "salary-ctc-calculator": {
        const res = calculateSalary(salaryCtc, basicPct, hraPct, true);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">CTC Structure</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Annual CTC (₹) *</label>
                  <Input
                    type="number"
                    value={salaryCtc}
                    onChange={(e) => setSalaryCtc(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Basic Salary (% of CTC)</label>
                  <Input
                    type="number"
                    value={basicPct}
                    onChange={(e) => setBasicPct(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">HRA (% of Basic)</label>
                  <Input
                    type="number"
                    value={hraPct}
                    onChange={(e) => setHraPct(Number(e.target.value))}
                  />
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4">
              <h2 className="text-base font-bold font-heading text-[#01574F]">Monthly Take-Home Breakdown</h2>
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-white rounded-xl border border-emerald-200 text-center space-y-1">
                  <span className="text-xs text-fyn-slate-muted">Monthly Net In-Hand Salary</span>
                  <div className="text-2xl font-bold font-heading text-[#01574F]">
                    ₹{res.netTakeHomeMonthly.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Basic Salary</span>
                  <strong>₹{res.basicMonthly.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">House Rent Allowance (HRA)</span>
                  <strong>₹{res.hraMonthly.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Special / Other Allowances</span>
                  <strong>₹{res.allowancesMonthly.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Employee PF Deduction (12%)</span>
                  <strong className="text-red-700">- ₹{res.employeePf.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Professional Tax</span>
                  <strong className="text-red-700">- ₹{res.professionalTax}</strong>
                </div>
              </div>
            </Card>
          </div>
        );
      }

      case "hsn-sac-search": {
        const results = searchHsnSac(hsnQuery, hsnFilter);
        return (
          <div className="space-y-6">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Search by Code or Description (e.g. 9982, Accounting, Computer...)"
                    value={hsnQuery}
                    onChange={(e) => setHsnQuery(e.target.value)}
                  />
                </div>
                <select
                  value={hsnFilter}
                  onChange={(e) => setHsnFilter(e.target.value as any)}
                  className="h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="ALL">All Codes (HSN + SAC)</option>
                  <option value="SAC">SAC (Services)</option>
                  <option value="HSN">HSN (Goods)</option>
                </select>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-fyn-slate-border font-bold uppercase text-[10px] text-fyn-slate">
                    <tr>
                      <th className="p-3">Type & Code</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Standard GST Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((r) => (
                      <tr key={r.code} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-mono font-bold text-fyn-primary">{r.code}</span>
                          <span className="block text-[10px] text-fyn-slate-muted">{r.type}</span>
                        </td>
                        <td className="p-3 font-semibold text-fyn-slate">{r.name}</td>
                        <td className="p-3 text-fyn-slate-muted">{r.category}</td>
                        <td className="p-3 font-bold text-emerald-800">{r.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      }

      case "due-date-checker": {
        const dates = checkDueDate(dueDateCategory);
        return (
          <div className="space-y-6">
            <div className="flex gap-2">
              {["ALL", "GST", "TDS", "ROC", "ITR"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDueDateCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    dueDateCategory === cat ? "bg-[#01574F] text-white font-bold" : "bg-white border text-fyn-slate"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dates.map((d) => (
                <Card key={d.type} variant="default" className="p-5 border-fyn-slate-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm">{d.frequency}</Badge>
                    <span className="font-mono font-bold text-fyn-primary text-sm">
                      {d.dateFixed || `${d.day}th of every month`}
                    </span>
                  </div>
                  <h3 className="font-bold font-heading text-sm text-fyn-slate">{d.name}</h3>
                  <p className="text-[11px] text-red-600 font-medium">Late Penalty: {d.penalty}</p>
                </Card>
              ))}
            </div>
          </div>
        );
      }

      case "business-registration-cost": {
        const res = estimateRegistrationCost(regType, regState, 100000);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">Select Entity Type & State</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Entity Structure *</label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                  >
                    <option value="PVT_LTD">Private Limited Company (SPICe+)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="OPC">One Person Company (OPC)</option>
                    <option value="SECTION_8">Section 8 Non-Profit Company</option>
                    <option value="PROPRIETORSHIP">Sole Proprietorship (MSME / GST)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Registered State *</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                  >
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Haryana">Haryana</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4">
              <h2 className="text-base font-bold font-heading text-[#01574F]">Estimated Incorporation Cost</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Government MCA Filing Fees</span>
                  <strong>₹{res.breakdown.govtFees.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">State Stamp Duty & Name Approval</span>
                  <strong>₹{(res.breakdown.stampDuty + res.breakdown.nameApprovalGovt).toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Class 3 Digital Signatures (DSC)</span>
                  <strong>₹{res.breakdown.dscCost.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-emerald-200">
                  <span className="text-fyn-slate-muted">Professional CA / CS Filing Fee (+18% GST)</span>
                  <strong>₹{res.totalProfessionalWithGst.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between py-3 text-sm font-bold text-[#01574F] bg-white p-3 rounded-xl border border-emerald-200">
                  <span>Total Estimated Outlay</span>
                  <span>₹{res.estimatedTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-[11px] text-fyn-slate-muted text-center">
                  Estimated Turnaround: <strong>{res.turnaroundDays}</strong>
                </div>
              </div>
            </Card>
          </div>
        );
      }

      case "virtual-cfo-assessment": {
        const res = assessVirtualCfo(cfoTurnover, cfoEmployees, cfoTxns, cfoChallenges);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="default" className="p-6 border-fyn-slate-border space-y-4">
              <h2 className="text-base font-bold font-heading text-fyn-slate">Operational Scale Parameters</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Annual Turnover (₹ Lakhs) *</label>
                  <Input
                    type="number"
                    value={cfoTurnover}
                    onChange={(e) => setCfoTurnover(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Employee Count *</label>
                  <Input
                    type="number"
                    value={cfoEmployees}
                    onChange={(e) => setCfoEmployees(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-fyn-slate mb-1">Key Operational Challenges</label>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {[
                      "Cash Flow Visibility",
                      "Statutory Reconciliations",
                      "Investor / Board Reporting",
                      "Unit Economics & Budgeting",
                    ].map((ch) => (
                      <label key={ch} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cfoChallenges.includes(ch)}
                          onChange={() => toggleCfoChallenge(ch)}
                        />
                        <span>{ch}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="default" className="p-6 border-fyn-slate-border bg-emerald-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-heading text-[#01574F]">CFO Advisory Recommendation</h2>
                <Badge variant="accent" size="sm">Score: {res.score}/100</Badge>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-sm text-fyn-slate font-heading">{res.title}</span>
                  <p className="text-[11px] text-fyn-slate-muted leading-relaxed">{res.description}</p>
                </div>
                <div className="space-y-1 pt-2">
                  <span className="font-bold text-[11px] uppercase text-fyn-primary">Suggested Retainer Scope:</span>
                  {res.suggestedServices.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-fyn-slate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#78BB69]" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3">
                  <Link href="/contact">
                    <Button variant="primary" size="sm" className="w-full font-bold">
                      Book Virtual CFO Consultation →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        );
      }

      default: {
        const res = calculateGst(10000, 18, false);
        return (
          <Card variant="default" className="p-8 text-center text-xs text-fyn-slate-muted border-fyn-slate-border space-y-4">
            <p>Calculator tool is operational. Configure parameters above to recalculate.</p>
            <Link href="/tools">
              <Button variant="outline" size="sm">Back to Tools Hub</Button>
            </Link>
          </Card>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-bold text-fyn-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Business Toolkit
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-fyn-slate capitalize">
            {String(slug).replace(/-/g, " ")}
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Instant indicative financial & statutory calculation module powered by Fyntrust.
          </p>
        </div>

        {renderToolBody()}

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong>Statutory Disclaimer:</strong> This tool provides an indicative calculation for informational purposes only and should not be treated as formal tax, legal, or accounting advice. Please consult a Fyntrust Chartered Accountant for advice tailored to your enterprise.
          </p>
        </div>
      </div>
    </div>
  );
}
