import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../auth/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Fyntrust Comprehensive Database Seed...");

  // 1. Clean existing data for deterministic fresh state (in correct FK dependency order)
  await prisma.auditLog.deleteMany({});
  await prisma.loginHistory.deleteMany({});
  await prisma.oTPVerification.deleteMany({});
  await prisma.orderMessage.deleteMany({});
  await prisma.orderStep.deleteMany({});
  await prisma.deliverable.deleteMany({});
  await prisma.expertTask.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.creditNote.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.recurringBillingCycle.deleteMany({});
  await prisma.recurringService.deleteMany({});
  await prisma.complianceRecord.deleteMany({});
  await prisma.complianceRule.deleteMany({});
  await prisma.complianceItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.cityServicePage.deleteMany({});
  await prisma.sEOPages.deleteMany({});
  await prisma.servicePackage.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.customerNotification.deleteMany({});
  await prisma.expertProfile.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.resourceItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.notificationTemplate.deleteMany({});
  await prisma.businessDiagnostic.deleteMany({});
  await prisma.toolConfig.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.companySetting.deleteMany({});
  await prisma.redirect.deleteMany({});
  await prisma.marketingAutomationRule.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});

  const defaultPassword = await hashPassword("Fyntrust@2026");

  // 2. Create Users
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@fyntrust.in",
      mobile: "9118066449",
      fullName: "Fyntrust Super Admin",
      passwordHash: defaultPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "operations@fyntrust.in",
      mobile: "9876543210",
      fullName: "Fyntrust Operations Lead",
      passwordHash: defaultPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: "sales@fyntrust.in",
      mobile: "9876543211",
      fullName: "Aniket Sharma",
      passwordHash: defaultPassword,
      role: "SALES",
      isActive: true,
    },
  });

  // 3. Create Experts
  const caUser1 = await prisma.user.create({
    data: {
      email: "ca.rohit@fyntrust.in",
      mobile: "9876543212",
      fullName: "CA Rohit Sharma",
      passwordHash: defaultPassword,
      role: "CA_FINANCE_EXPERT",
      isActive: true,
    },
  });

  const expert1 = await prisma.expertProfile.create({
    data: {
      userId: caUser1.id,
      qualification: "FCA (Fellow Chartered Accountant)",
      expertise: JSON.stringify(["GST Filing", "Income Tax Audit", "Corporate Tax Planning"]),
      city: "Lucknow",
      state: "Uttar Pradesh",
      experienceYears: 11,
      assignedCategories: JSON.stringify(["tax-services", "accounting-finance"]),
      availabilityStatus: "AVAILABLE",
      rating: 4.95,
      commissionRate: 70.0,
    },
  });

  const csUser = await prisma.user.create({
    data: {
      email: "cs.ananya@fyntrust.in",
      mobile: "9876543213",
      fullName: "CS Ananya Verma",
      passwordHash: defaultPassword,
      role: "CA_FINANCE_EXPERT",
      isActive: true,
    },
  });

  await prisma.expertProfile.create({
    data: {
      userId: csUser.id,
      qualification: "ACS (Company Secretary)",
      expertise: JSON.stringify(["ROC Filings", "Pvt Ltd Incorporation", "MCA Compliance"]),
      city: "Delhi",
      state: "Delhi",
      experienceYears: 8,
      assignedCategories: JSON.stringify(["business-registration", "mca-roc-compliance"]),
      availabilityStatus: "AVAILABLE",
      rating: 4.9,
      commissionRate: 65.0,
    },
  });

  // 4. Create Customer User & Profile
  const customerUser = await prisma.user.create({
    data: {
      email: "client@aaravtech.com",
      mobile: "9876543214",
      fullName: "Aarav Singhania",
      passwordHash: defaultPassword,
      role: "CUSTOMER",
      isActive: true,
    },
  });

  const customerProfile = await prisma.customerProfile.create({
    data: {
      userId: customerUser.id,
      businessName: "Aarav Technologies Pvt Ltd",
      businessType: "Private Limited Company",
      gstNumber: "09AAACA1234A1Z5",
      panNumber: "AAACA1234A",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
      turnoverBand: "₹1 Cr - ₹5 Cr",
      industry: "Information Technology",
      address: "Gomtinagar Extension, Lucknow, UP - 226010",
    },
  });

  // 5. Seed Service Categories
  const categories = [
    {
      name: "Business Registration",
      slug: "business-registration",
      description: "Pvt Ltd, LLP, OPC, Partnership, MSME & Startup India Incorporations.",
      icon: "Building2",
      displayOrder: 1,
    },
    {
      name: "Tax Services",
      slug: "tax-services",
      description: "GST & Income Tax Filings, Tax Planning, TDS & Notice Assistance.",
      icon: "Receipt",
      displayOrder: 2,
    },
    {
      name: "Accounting & Finance",
      slug: "accounting-finance",
      description: "Monthly Bookkeeping, Ledger Management, MIS & Financial Statements.",
      icon: "Calculator",
      displayOrder: 3,
    },
    {
      name: "Payroll & HR Compliance",
      slug: "payroll-compliance",
      description: "Salary Calculations, PF, ESIC, Professional Tax & Statutory Deductions.",
      icon: "Users",
      displayOrder: 4,
    },
    {
      name: "MCA / ROC Compliance",
      slug: "mca-roc-compliance",
      description: "Annual ROC Filings, Director KYC, Share Capital & Company Maintenance.",
      icon: "FileCheck",
      displayOrder: 5,
    },
    {
      name: "Virtual CFO",
      slug: "virtual-cfo",
      description: "Executive Financial Planning, Cash Flow Control, KPI Dashboards & Strategy.",
      icon: "TrendingUp",
      displayOrder: 6,
    },
    {
      name: "Business Legal Support",
      slug: "legal-support",
      description: "Commercial Agreement Drafting, Contract Review, Trademark & Legal Notices.",
      icon: "Scale",
      displayOrder: 7,
    },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.serviceCategory.create({ data: cat });
    catMap[cat.slug] = created.id;
  }

  // 6. Comprehensive Services Seed
  const servicesData = [
    // 1. Business Registration
    {
      categoryId: catMap["business-registration"],
      name: "Private Limited Company Registration",
      slug: "private-limited-company-registration",
      shortDescription: "Incorporate your Private Limited Company with 2 DIN, DSC, Name Approval, MOA/AOA, PAN, TAN & Bank Account assistance.",
      fullDescription: "The most prestigious and scalable business entity in India for startups and growing enterprises seeking investment and limited liability protection.",
      startingPrice: 6999,
      discountPrice: 9999,
      slaDays: 7,
      department: "ROC",
      expertCategory: "CA_FINANCE_EXPERT",
      whatsIncluded: JSON.stringify([
        "2 Digital Signature Certificates (DSC)",
        "2 Director Identification Numbers (DIN)",
        "RUN Name Approval on MCA Portal",
        "SPICe+ Part B Incorporation Filing",
        "Drafting of MOA & AOA",
        "Company PAN & TAN",
        "Certificate of Incorporation (COI)",
        "Bank Account Opening Support",
      ]),
      eligibility: JSON.stringify([
        "Minimum 2 Directors (at least 1 Indian Resident)",
        "Minimum 2 Shareholders",
        "Registered Office Address proof in India",
      ]),
      documentsRequired: JSON.stringify([
        "PAN Card & Aadhaar Card of all Directors",
        "Passport / Voter ID / Driving License (Identity Proof)",
        "Bank Statement / Electricity Bill (Address Proof < 2 months old)",
        "Passport size photographs",
        "Electricity Bill & Rent Agreement / NOC for Registered Office",
      ]),
      processSteps: JSON.stringify([
        { step: 1, title: "DSC & Document Collection", desc: "Digital signatures created and KYC verified" },
        { step: 2, title: "Name Reservation (RUN)", desc: "Unique company name submitted for MCA approval" },
        { step: 3, title: "SPICe+ Filing", desc: "Incorporation forms, MOA and AOA submitted" },
        { step: 4, title: "Government Processing", desc: "MCA scrutiny and verification" },
        { step: 5, title: "Certificate Delivery", desc: "COI, PAN, TAN and incorporation kit issued" },
      ]),
      faqs: JSON.stringify([
        { q: "What is the minimum capital required?", a: "There is no minimum paid-up capital requirement to start a Private Limited Company." },
        { q: "Is physical presence required in ROC office?", a: "No, the entire process is 100% online through MCA SPICe+ portal." },
      ]),
      isFeatured: true,
      isActive: true,
      packages: [
        { name: "Starter Incorporation", tier: "STARTER", price: 6999, features: JSON.stringify(["2 DIN + 2 DSC", "Name Approval", "Incorporation Filing", "PAN & TAN"]), isPopular: false },
        { name: "All-in-One Startup Suite", tier: "GROWTH", price: 9999, features: JSON.stringify(["Complete Incorporation", "GST Registration", "MSME/Udyam", "1st Month Accounting Advisory", "Trademark Filing Support"]), isPopular: true },
      ],
    },
    {
      categoryId: catMap["business-registration"],
      name: "LLP Registration",
      slug: "llp-registration",
      shortDescription: "Limited Liability Partnership registration offering organizational flexibility and limited liability.",
      fullDescription: "LLP is ideal for professional consulting firms and service providers seeking lower compliance burdens compared to Pvt Ltd companies.",
      startingPrice: 4999,
      discountPrice: 7499,
      slaDays: 6,
      department: "ROC",
      expertCategory: "CA_FINANCE_EXPERT",
      whatsIncluded: JSON.stringify(["2 DSCs", "2 DPINs", "Name Approval", "FiLLiP Form Filing", "LLP Agreement Drafting & Form 3 Filing"]),
      eligibility: JSON.stringify(["Minimum 2 Designated Partners", "Indian Registered Office"]),
      documentsRequired: JSON.stringify(["PAN & ID Proofs of Partners", "Address Proof of Registered Office"]),
      processSteps: JSON.stringify([
        { step: 1, title: "DSC Preparation", desc: "Obtain digital signatures for partners" },
        { step: 2, title: "Name Reservation", desc: "Reserve LLP name on MCA" },
        { step: 3, title: "FiLLiP Filing", desc: "File incorporation application" },
        { step: 4, title: "LLP Agreement", desc: "Draft and execute partnership deed" },
      ]),
      isFeatured: false,
      isActive: true,
    },

    // 2. Tax Services
    {
      categoryId: catMap["tax-services"],
      name: "GST Registration",
      slug: "gst-registration",
      shortDescription: "Get complete GST registration support with document verification and application filing.",
      fullDescription: "Mandatory tax registration for businesses crossing statutory turnover limits (₹20L/₹40L) or engaged in inter-state e-commerce supply.",
      startingPrice: 499,
      discountPrice: 999,
      slaDays: 3,
      department: "TAX",
      expertCategory: "CA_FINANCE_EXPERT",
      whatsIncluded: JSON.stringify([
        "Expert CA Assistance",
        "Document Verification",
        "Application Preparation & ARN Generation",
        "Filing Support on GST Portal",
        "GSTIN Certificate Delivery",
      ]),
      eligibility: JSON.stringify([
        "Turnover above ₹20L/₹40L threshold",
        "Interstate goods suppliers",
        "E-commerce sellers & marketplace merchants",
      ]),
      documentsRequired: JSON.stringify([
        "PAN Card of Business / Proprietor",
        "Aadhaar Card of Promoters",
        "Electricity Bill / Rent Agreement for Proof of Place of Business",
        "Cancelled Cheque / Bank Statement",
      ]),
      processSteps: JSON.stringify([
        { step: 1, title: "Submit Details", desc: "Fill basic business details in 2 minutes" },
        { step: 2, title: "Upload Documents", desc: "Upload PAN, Aadhaar, and address proof" },
        { step: 3, title: "CA Verification", desc: "Fyntrust CA reviews and prepares application" },
        { step: 4, title: "Govt Submission", desc: "Filing on GSTN portal and ARN generation" },
        { step: 5, title: "Certificate Delivery", desc: "Receive your GSTIN and GST Certificate" },
      ]),
      faqs: JSON.stringify([
        { q: "How long does GST registration take?", a: "Typically 3 to 7 working days depending on state tax department verification." },
        { q: "Is physical presence required?", a: "No, the entire process is 100% online and paperless." },
      ]),
      isFeatured: true,
      isActive: true,
      packages: [
        { name: "Proprietorship GST", tier: "STARTER", price: 499, features: JSON.stringify(["1 GSTIN Application", "Document Verification", "Free 1st Month Advisory"]), isPopular: false },
        { name: "Pvt Ltd / LLP GST", tier: "GROWTH", price: 999, features: JSON.stringify(["Board Resolution drafting", "Complete filing", "Authorized Signatory Setup", "Dedicated CA"]), isPopular: true },
      ],
    },
    {
      categoryId: catMap["tax-services"],
      name: "GST Return Filing",
      slug: "gst-return-filing",
      shortDescription: "Monthly and quarterly GST return filing (GSTR-1, GSTR-3B, IFF, CMP-08) with ITC reconciliation.",
      fullDescription: "Accurate tax liability computation, Input Tax Credit (ITC) optimization, reconciliation against GSTR-2B, and timely filing to avoid late fees.",
      startingPrice: 999,
      discountPrice: 1499,
      slaDays: 2,
      department: "TAX",
      expertCategory: "CA_FINANCE_EXPERT",
      whatsIncluded: JSON.stringify(["Monthly GSTR-1 & GSTR-3B Filing", "2B Reconciliation", "ITC Optimization", "Tax Challan Generation", "CA Advisory"]),
      eligibility: JSON.stringify(["Any active GSTIN registered business"]),
      documentsRequired: JSON.stringify(["Sales Register", "Purchase Register", "Bank Statement for the month"]),
      processSteps: JSON.stringify([
        { step: 1, title: "Data Upload", desc: "Provide monthly sales and purchase invoices" },
        { step: 2, title: "Reconciliation", desc: "CA reconciles ITC with GSTR-2B" },
        { step: 3, title: "Tax Computation", desc: "Net tax liability computed and approved" },
        { step: 4, title: "Filing & Ack", desc: "Return filed and filing acknowledgment shared" },
      ]),
      isFeatured: true,
      isActive: true,
    },
    {
      categoryId: catMap["tax-services"],
      name: "Income Tax Return (ITR) Filing",
      slug: "income-tax-return-filing",
      shortDescription: "Expert CA-assisted ITR filing for individuals, professionals, HUFs, and corporate entities.",
      fullDescription: "Comprehensive tax deduction maximization, capital gains computation, business income scheduling, and error-free e-verification.",
      startingPrice: 799,
      discountPrice: 1299,
      slaDays: 2,
      department: "TAX",
      expertCategory: "CA_FINANCE_EXPERT",
      whatsIncluded: JSON.stringify(["ITR Form Selection (ITR 1-7)", "Form 26AS & AIS Reconciliation", "Tax Saving Deductions Review", "E-Filing & E-Verification"]),
      eligibility: JSON.stringify(["Salaried individuals, professionals, freelancers, businesses"]),
      documentsRequired: JSON.stringify(["Form 16 / Profit & Loss Statement", "Bank Statements", "AIS / Form 26AS", "Investment Proofs"]),
      processSteps: JSON.stringify([
        { step: 1, title: "Upload Info", desc: "Submit Form 16 or income records" },
        { step: 2, title: "Tax Computation", desc: "CA optimizes tax deductions & exemptions" },
        { step: 3, title: "Client Approval", desc: "Review final computation sheet" },
        { step: 4, title: "E-Filing", desc: "Filing on Income Tax Portal with ITR-V ack" },
      ]),
      isFeatured: true,
      isActive: true,
    },

    // 3. Accounting & Finance
    {
      categoryId: catMap["accounting-finance"],
      name: "Monthly Bookkeeping & Accounting",
      slug: "monthly-bookkeeping-accounting",
      shortDescription: "Complete cloud bookkeeping, day-to-day ledger posting, and bank reconciliation by dedicated accountants.",
      fullDescription: "Maintain clean financial books, comply with accounting standards, and get monthly financial insights without hiring full-time in-house accountants.",
      startingPrice: 2999,
      discountPrice: 4499,
      slaDays: 5,
      department: "ACCOUNTING",
      expertCategory: "ACCOUNTANT",
      whatsIncluded: JSON.stringify(["Bank Reconciliation", "Sales & Purchase Ledger Entry", "Accounts Payable & Receivable Tracking", "Monthly Trial Balance", "Expense Categorization"]),
      eligibility: JSON.stringify(["MSMEs, startups, clinics, retail and consulting businesses"]),
      documentsRequired: JSON.stringify(["Bank Statements", "Invoices & Expense Bills", "Payment Gateway Settlement Sheets"]),
      processSteps: JSON.stringify([
        { step: 1, title: "Document Sync", desc: "Upload bills & bank statements via portal" },
        { step: 2, title: "Ledger Posting", desc: "Accountant categorizes and posts entries" },
        { step: 3, title: "Bank Reconciliation", desc: "Balances reconciled against statement" },
        { step: 4, title: "Monthly P&L", desc: "P&L and Balance Sheet generated" },
      ]),
      isFeatured: true,
      isActive: true,
    },
    {
      categoryId: catMap["accounting-finance"],
      name: "MIS Reporting & Financial Statements",
      slug: "mis-reporting-financial-statements",
      shortDescription: "Customized management information system (MIS) reports, KPI dashboards, and financial statements.",
      fullDescription: "Executive monthly dashboards covering revenue trends, gross margin analysis, expense breakdowns, and cash flow velocity.",
      startingPrice: 4999,
      discountPrice: 7999,
      slaDays: 4,
      department: "ACCOUNTING",
      expertCategory: "CA_FINANCE_EXPERT",
      whatsIncluded: JSON.stringify(["Monthly Executive P&L Dashboard", "Cash Flow Forecast", "Departmental Cost Analysis", "Budget vs Actual Variance Analysis"]),
      eligibility: JSON.stringify(["Growing businesses with ₹50L+ turnover"]),
      documentsRequired: JSON.stringify(["Tally / Zoho Books backup or Monthly Ledgers"]),
      processSteps: JSON.stringify([
        { step: 1, title: "Data Ingestion", desc: "Financial data audited" },
        { step: 2, title: "MIS Compilation", desc: "Metrics mapped to management goals" },
        { step: 3, title: "Executive Review", desc: "Monthly report presentation" },
      ]),
      isFeatured: false,
      isActive: true,
    },

    // 4. Payroll & HR Compliance
    {
      categoryId: catMap["payroll-compliance"],
      name: "Payroll Processing & Compliance",
      slug: "payroll-processing-compliance",
      shortDescription: "End-to-end salary processing, payslip generation, PF, ESIC, and Professional Tax compliance.",
      fullDescription: "Ensure accurate payroll calculations, timely statutory deductions, salary disbursement reports, and automated employee payslips.",
      startingPrice: 1499,
      discountPrice: 2499,
      slaDays: 3,
      department: "ACCOUNTING",
      expertCategory: "ACCOUNTANT",
      whatsIncluded: JSON.stringify(["Monthly Salary Register", "Automated PDF Payslips", "PF & ESIC Challan Generation", "TDS on Salary (Form 24Q) Preparation"]),
      eligibility: JSON.stringify(["Businesses with 2 to 200 employees"]),
      documentsRequired: JSON.stringify(["Employee Master List", "Monthly Attendance & Leave Records"]),
      processSteps: JSON.stringify([
        { step: 1, title: "Attendance Upload", desc: "Submit monthly leave/attendance data" },
        { step: 2, title: "Salary Calculation", desc: "Deductions (PF, ESIC, TDS) computed" },
        { step: 3, title: "Challan Generation", desc: "Statutory challans generated for payment" },
        { step: 4, title: "Payslip Release", desc: "Payslips dispatched to employees" },
      ]),
      isFeatured: false,
      isActive: true,
    },

    // 5. MCA / ROC Compliance
    {
      categoryId: catMap["mca-roc-compliance"],
      name: "Annual ROC Filing for Companies",
      slug: "annual-roc-filing-company",
      shortDescription: "Mandatory annual statutory compliance for Private Limited Companies (AOC-4, MGT-7, DIR-3 KYC).",
      fullDescription: "Stay 100% compliant with the Companies Act 2013, avoid heavy director disqualifications and per-day government penalties.",
      startingPrice: 4999,
      discountPrice: 8999,
      slaDays: 5,
      department: "ROC",
      expertCategory: "CA_FINANCE_EXPERT",
      whatsIncluded: JSON.stringify(["AOC-4 Financial Statements Filing", "MGT-7 Annual Return Filing", "DIR-3 KYC for 2 Directors", "Board Resolution Drafting", "Secretarial Audit Checklist"]),
      eligibility: JSON.stringify(["All registered Private Limited Companies and Section 8 Companies"]),
      documentsRequired: JSON.stringify(["Audited Financial Statements", "Director KYC details", "Auditor Appointment Details"]),
      processSteps: JSON.stringify([
        { step: 1, title: "Audit Report Collection", desc: "Collect signed Balance Sheet & P&L" },
        { step: 2, title: "Form Preparation", desc: "CS drafts AOC-4, MGT-7 and resolutions" },
        { step: 3, title: "Digital Signing", desc: "DSC affixed by Director and CS/CA" },
        { step: 4, title: "MCA Filing", desc: "Filing on MCA V3 with SRN acknowledgment" },
      ]),
      isFeatured: true,
      isActive: true,
    },

    // 6. Virtual CFO
    {
      categoryId: catMap["virtual-cfo"],
      name: "Virtual CFO Advisory",
      slug: "virtual-cfo-advisory",
      shortDescription: "Access senior CFO-level financial leadership, cash flow planning, and strategic advisory without hiring a full-time CFO.",
      fullDescription: "Partner with experienced finance leaders who manage your cash runway, optimize margins, guide capital allocation, and prepare your business for institutional fundraising.",
      startingPrice: 10000,
      discountPrice: 15000,
      slaDays: 1,
      department: "CFO",
      expertCategory: "VIRTUAL_CFO",
      whatsIncluded: JSON.stringify([
        "Dedicated Senior Virtual CFO",
        "Monthly Financial Review Meeting",
        "13-Week Rolling Cash Flow Forecasting",
        "Unit Economics & Margin Optimization",
        "Budgeting & Working Capital Management",
        "Investor MIS & Board Presentation Support",
      ]),
      eligibility: JSON.stringify([
        "Startups from Seed to Series A",
        "MSMEs with annual turnover from ₹1 Cr to ₹50 Cr",
        "Family businesses undergoing digital scale",
      ]),
      documentsRequired: JSON.stringify([
        "Last 2 Years Audited Balance Sheet & P&L",
        "Current Year Monthly Ledgers",
        "Banking Statements & Existing Borrowing details",
      ]),
      processSteps: JSON.stringify([
        { step: 1, title: "Financial Diagnostic", desc: "Comprehensive review of current financial health & cash flow" },
        { step: 2, title: "Strategic Roadmap", desc: "Design customized KPI framework, budgets, and forecasts" },
        { step: 3, title: "Active Governance", desc: "Bi-weekly CFO reviews, runway tracking, and decision advisory" },
        { step: 4, title: "Growth & Scale", desc: "Support for debt/equity fundraising and investor meetings" },
      ]),
      faqs: JSON.stringify([
        { q: "How is a Virtual CFO different from a regular CA?", a: "While a CA focuses primarily on tax compliance and statutory audit, a Virtual CFO focuses forward on business strategy, profitability, cash flow, and growth." },
        { q: "Can we hire on a flexible monthly retainer?", a: "Yes, our Virtual CFO plans are available on flexible monthly retainers with scope tailored to your business scale." },
      ]),
      isFeatured: true,
      isActive: true,
      packages: [
        { name: "Growth CFO", tier: "GROWTH", price: 10000, features: JSON.stringify(["Monthly Financial Strategy Review", "Cash Flow Forecasting", "KPI Dashboards", "Working Capital Optimization"]), isPopular: true },
        { name: "Executive CFO", tier: "PREMIUM", price: 25000, features: JSON.stringify(["Weekly CFO Governance", "Investor MIS & Pitch Deck Support", "Fundraising Due Diligence", "Direct Founder Advisory"]), isPopular: false },
      ],
    },

    // 7. Business Legal Support
    {
      categoryId: catMap["legal-support"],
      name: "Business Agreement & Contract Drafting",
      slug: "business-agreement-contract-drafting",
      shortDescription: "Custom commercial agreements drafted and reviewed by qualified corporate legal professionals.",
      fullDescription: "Protect your business interests with professionally drafted Founder Agreements, NDAs, Service Level Agreements, and Vendor Contracts.",
      startingPrice: 2499,
      discountPrice: 3999,
      slaDays: 3,
      department: "LEGAL",
      expertCategory: "LEGAL_PARTNER",
      whatsIncluded: JSON.stringify(["Customized Contract Drafting", "1 Round of Legal Revisions", "Risk Analysis & Exemption Clauses", "Execution Ready PDF & Word copies"]),
      eligibility: JSON.stringify(["Any business entering into commercial transactions"]),
      documentsRequired: JSON.stringify(["Parties details", "Commercial terms sheet / Key requirements"]),
      processSteps: JSON.stringify([
        { step: 1, title: "Requirement Gathering", desc: "Specify contract type and commercial terms" },
        { step: 2, title: "Drafting", desc: "Legal partner crafts customized agreement" },
        { step: 3, title: "Review & Polish", desc: "Revisions incorporated based on client feedback" },
        { step: 4, title: "Final Delivery", desc: "Execution-ready contract delivered" },
      ]),
      isFeatured: false,
      isActive: true,
    },
    {
      categoryId: catMap["legal-support"],
      name: "Trademark Registration Assistance",
      slug: "trademark-registration",
      shortDescription: "Protect your brand name, logo, and slogan with complete Trademark search and application filing.",
      fullDescription: "Get exclusive brand rights across India with comprehensive trademark classification, TM search, drafting, and TM-A filing.",
      startingPrice: 4999,
      discountPrice: 7999,
      slaDays: 4,
      department: "LEGAL",
      expertCategory: "LEGAL_PARTNER",
      whatsIncluded: JSON.stringify(["Trademark Search Report", "Class Selection Support", "TM-A Application Drafting", "Filing on IP India Portal", "TM Application Number (Immediate ™ usage)"]),
      eligibility: JSON.stringify(["Individuals, Startups, LLPs, Companies"]),
      documentsRequired: JSON.stringify(["Logo / Brand Name image", "Applicant Identity Proof", "User Affidavit (if prior use claimed)"]),
      processSteps: JSON.stringify([
        { step: 1, title: "TM Search", desc: "Verify availability across classes" },
        { step: 2, title: "Drafting", desc: "Prepare TM-A form & power of attorney" },
        { step: 3, title: "Filing", desc: "Submit on Indian Trademark Registry" },
        { step: 4, title: "Ack Delivery", desc: "Receive TM number and start using ™" },
      ]),
      isFeatured: true,
      isActive: true,
    },
  ];

  for (const s of servicesData) {
    const { packages, ...serviceFields } = s;
    const createdService = await prisma.service.create({
      data: serviceFields,
    });

    if (packages && packages.length > 0) {
      for (const p of packages) {
        await prisma.servicePackage.create({
          data: {
            serviceId: createdService.id,
            ...p,
          },
        });
      }
    }
  }

  // 7. Seed Sample Order for Phase 1/2 parity
  const gstServiceObj = await prisma.service.findUnique({ where: { slug: "gst-registration" } });
  if (gstServiceObj) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: "FYN-2026-0001",
        customerId: customerProfile.id,
        serviceId: gstServiceObj.id,
        status: "WORK_IN_PROGRESS",
        paymentStatus: "PAID",
        totalAmount: 999.0,
        assignedExpertId: expert1.id,
        assignedAt: new Date(),
        requirementData: JSON.stringify({
          natureOfBusiness: "Software SaaS & Services",
          estimatedTurnover: "₹50 Lakhs",
        }),
      },
    });

    await prisma.orderStep.createMany({
      data: [
        { orderId: sampleOrder.id, stepNumber: 1, title: "Order & Payment Verified", status: "COMPLETED", completedAt: new Date() },
        { orderId: sampleOrder.id, stepNumber: 2, title: "Document Verification", status: "COMPLETED", completedAt: new Date() },
        { orderId: sampleOrder.id, stepNumber: 3, title: "Application Preparation", status: "IN_PROGRESS" },
        { orderId: sampleOrder.id, stepNumber: 4, title: "Government Processing", status: "PENDING" },
        { orderId: sampleOrder.id, stepNumber: 5, title: "Certificate Delivery", status: "PENDING" },
      ],
    });
  }

  // 8. Seed Cities
  const cities = [
    { name: "Delhi", slug: "delhi", state: "Delhi", isPopular: true, seoTitle: "CA & Financial Advisory Services in Delhi | Fyntrust", seoDescription: "Access certified Chartered Accountants and tax consultants in Delhi NCR for GST, ITR, Company Registration & CFO services." },
    { name: "Mumbai", slug: "mumbai", state: "Maharashtra", isPopular: true, seoTitle: "Top CA & Business Compliance Services in Mumbai | Fyntrust", seoDescription: "Leading financial advisory, Virtual CFO, and corporate tax compliance platform for Mumbai enterprises." },
    { name: "Bengaluru", slug: "bengaluru", state: "Karnataka", isPopular: true, seoTitle: "Startup CA, Accounting & Virtual CFO in Bengaluru | Fyntrust", seoDescription: "Complete finance, accounting, and compliance ecosystem for Bengaluru tech startups and MSMEs." },
    { name: "Lucknow", slug: "lucknow", state: "Uttar Pradesh", isPopular: true, seoTitle: "Chartered Accountant & Finance Advisory in Lucknow | Fyntrust", seoDescription: "Trusted CA network in Lucknow for GST filing, Company Incorporation, Tax Audit and Bookkeeping." },
    { name: "Varanasi", slug: "varanasi", state: "Uttar Pradesh", isPopular: true, seoTitle: "CA & Business Tax Services in Varanasi | Fyntrust", seoDescription: "Professional tax, accounting and business registration services across Varanasi." },
    { name: "Noida", slug: "noida", state: "Uttar Pradesh", isPopular: true, seoTitle: "Corporate CA & Compliance Firm in Noida | Fyntrust", seoDescription: "End-to-end accounting, GST and corporate ROC compliance for Noida businesses." },
    { name: "Ghaziabad", slug: "ghaziabad", state: "Uttar Pradesh", isPopular: false, seoTitle: "CA & Tax Consulting in Ghaziabad | Fyntrust", seoDescription: "Business finance and tax services in Ghaziabad." },
    { name: "Hyderabad", slug: "hyderabad", state: "Telangana", isPopular: true, seoTitle: "CA & Virtual CFO Services in Hyderabad | Fyntrust", seoDescription: "Top-tier financial consulting and tax compliance in Hyderabad." },
    { name: "Chennai", slug: "chennai", state: "Tamil Nadu", isPopular: true, seoTitle: "CA & Corporate Legal Advisory in Chennai | Fyntrust", seoDescription: "Chartered Accountants and legal partners in Chennai." },
    { name: "Kolkata", slug: "kolkata", state: "West Bengal", isPopular: true, seoTitle: "Business Accounting & CA Services in Kolkata | Fyntrust", seoDescription: "Complete financial and compliance services in Kolkata." },
    { name: "Pune", slug: "pune", state: "Maharashtra", isPopular: true, seoTitle: "CA & Startup Compliance in Pune | Fyntrust", seoDescription: "Specialized CA and Virtual CFO solutions for Pune businesses." },
    { name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", isPopular: true, seoTitle: "CA & Business Advisory in Ahmedabad | Fyntrust", seoDescription: "Finance, tax planning and ROC compliance in Ahmedabad." },
    { name: "Jaipur", slug: "jaipur", state: "Rajasthan", isPopular: true, seoTitle: "CA & Tax Advisory in Jaipur | Fyntrust", seoDescription: "Trusted CA network in Jaipur." },
    { name: "Patna", slug: "patna", state: "Bihar", isPopular: false, seoTitle: "CA Services & Tax Filing in Patna | Fyntrust", seoDescription: "Business tax and registration services in Patna." },
    { name: "Chandigarh", slug: "chandigarh", state: "Punjab/Haryana", isPopular: true, seoTitle: "CA & Financial Strategy in Chandigarh | Fyntrust", seoDescription: "Professional CA services across the Tricity region." },
  ];

  await prisma.city.createMany({ data: cities });

  // 9. Seed Corporate Testimonials / Reviews
  const reviews = [
    {
      customerName: "Rajeev Bansal",
      businessName: "Bansal Logistics & Cold Chain",
      city: "Lucknow",
      serviceName: "GST & Monthly Bookkeeping",
      rating: 5,
      reviewText: "Fyntrust transformed our entire financial operations. With multiple interstate fleet operations, their dedicated CA team handles our GST returns and monthly MIS reporting with zero delays.",
      isPublished: true,
      displayOrder: 1,
    },
    {
      customerName: "Megha Soni",
      businessName: "Zenith Edutech Private Limited",
      city: "Bengaluru",
      serviceName: "Virtual CFO & ROC Compliance",
      rating: 5,
      reviewText: "As an early-stage startup, having a full-time CFO was cost-prohibitive. Fyntrust's Virtual CFO service gave us boardroom-level financial discipline and 13-week runway visibility.",
      isPublished: true,
      displayOrder: 2,
    },
    {
      customerName: "Vikram Malhotra",
      businessName: "Malhotra Precision Engineering",
      city: "Delhi",
      serviceName: "Pvt Ltd Registration & Tax Audit",
      rating: 5,
      reviewText: "From incorporating our private limited company to conducting our annual statutory tax audits, Fyntrust acts like our in-house corporate finance team. Truly professional.",
      isPublished: true,
      displayOrder: 3,
    },
  ];

  await prisma.review.createMany({ data: reviews });

  // 10. Seed Resource Items & Educational Content
  const resources = [
    { title: "Master Business Compliance Calendar 2026-27", category: "CHECKLIST", fileUrl: "#", fileType: "PDF", isPublic: true },
    { title: "GST Input Tax Credit (ITC) Optimization Guide", category: "GUIDE", fileUrl: "#", fileType: "PDF", isPublic: true },
    { title: "Standard Founder & Co-Founder Agreement Template", category: "TEMPLATE", fileUrl: "#", fileType: "DOCX", isPublic: true },
    { title: "Pvt Ltd vs LLP: Comprehensive Decision Matrix for Indian Founders", category: "GUIDE", fileUrl: "#", fileType: "PDF", isPublic: true },
    { title: "Startup Financial Model & Unit Economics Template", category: "TEMPLATE", fileUrl: "#", fileType: "XLSX", isPublic: true },
  ];

  await prisma.resourceItem.createMany({ data: resources });

  // 11. Seed Dynamic Blog Posts
  const blogs = [
    {
      title: "Key Compliance Deadlines Every Indian Business Must Track in FY 2026-27",
      slug: "key-compliance-deadlines-fy-2026-27",
      category: "COMPLIANCE",
      excerpt: "A comprehensive roadmap of GST, Income Tax, TDS, and MCA ROC filing statutory due dates to avoid penalty notices.",
      content: `Maintaining continuous statutory compliance is foundational to running a healthy business in India. Between GST return filings (GSTR-1, GSTR-3B), advance tax quarterly schedules, and annual ROC filings (AOC-4, MGT-7), missing deadlines can lead to compounding late fees, interest penalties, and potential director disqualification.\n\n### 1. Goods & Services Tax (GST) Deadlines\n- **GSTR-1 (Monthly):** 11th of every succeeding month.\n- **GSTR-3B (Monthly):** 20th of every succeeding month.\n- **GSTR-9 & 9C (Annual Return):** 31st December following the close of the financial year.\n\n### 2. Advance Tax Quarterly Installments\n- 15th June: 15% of estimated tax liability\n- 15th September: 45% of estimated tax liability\n- 15th December: 75% of estimated tax liability\n- 15th March: 100% of estimated tax liability\n\n### 3. MCA & Corporate Governance Filings\n- **DIR-3 KYC:** Annually by 30th September.\n- **AOC-4 (Financial Statements):** Within 30 days of Annual General Meeting (AGM).\n- **MGT-7 (Annual Return):** Within 60 days of AGM.\n\nPartnering with Fyntrust's PAN India CA and compliance network ensures your calendar is automatically tracked with proactive reminders.`,
      authorName: "CA Rohit Sharma",
      metaTitle: "Key Business Compliance Deadlines FY 2026-27 | Fyntrust",
      metaDescription: "Check all GST, ITR, TDS and MCA due dates for FY 2026-27. Stay penalty-free with Fyntrust compliance guidance.",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "How Virtual CFOs Help Indian MSMEs Scale Sustainably",
      slug: "how-virtual-cfos-help-indian-msmes-scale",
      category: "VIRTUAL_CFO",
      excerpt: "Why modern businesses are replacing full-time CFO salaries with fractional, expert financial leadership.",
      content: `For most growing businesses generating between ₹1 Cr and ₹50 Cr in annual turnover, hiring a full-time Chief Financial Officer (CFO) carrying a ₹30L–₹50L annual compensation package is often economically unfeasible. Yet, relying solely on traditional bookkeeping leaves founders blind to unit economics, burn velocity, and working capital traps.\n\n### What a Virtual CFO Delivers\n1. **13-Week Cash Flow Velocity Modeling:** Predicting liquidity crunches weeks in advance.\n2. **Margin & Pricing Analysis:** Identifying low-margin clients, inventory leakages, and unrecovered overheads.\n3. **Debt & Equity Readiness:** Structuring clean data rooms and investor-grade MIS reports.\n4. **Founder Advisory:** Acting as an objective financial sounding board in strategic boardroom decisions.\n\nFyntrust's Virtual CFO network provides customized, executive-level financial oversight tailored to your business scale.`,
      authorName: "Vikash Gupta, CFA",
      metaTitle: "Virtual CFO for MSMEs: Benefits & Pricing | Fyntrust",
      metaDescription: "Discover how fractional CFO advisory brings cash flow management and investor reporting to growing Indian enterprises.",
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const b of blogs) {
    await prisma.blog.create({ data: b });
  }

  console.log("✅ Comprehensive Fyntrust Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
