export interface ServiceQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "number" | "dropdown" | "radio" | "checkbox" | "date";
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface ServiceRequirementConfig {
  questions: ServiceQuestion[];
  documents: {
    name: string;
    description: string;
    required: boolean;
    category: string;
  }[];
}

export const SERVICE_REQUIREMENTS: Record<string, ServiceRequirementConfig> = {
  "gst-registration": {
    questions: [
      {
        id: "natureOfBusiness",
        question: "Primary Nature of Business Activity",
        type: "dropdown",
        required: true,
        options: [
          "Retail / E-Commerce Trade",
          "Wholesale / Distribution",
          "Software & Digital Services",
          "Consulting & Professional Services",
          "Manufacturing",
          "Restaurant / Hospitality",
          "Other Commercial Activities",
        ],
        helpText: "Select the primary operational vertical for GST classification.",
      },
      {
        id: "turnoverBand",
        question: "Estimated Annual Turnover",
        type: "dropdown",
        required: true,
        options: [
          "Below ₹20 Lakhs (Voluntary Registration)",
          "₹20 Lakhs to ₹40 Lakhs",
          "₹40 Lakhs to ₹1.5 Crores",
          "Above ₹1.5 Crores",
        ],
      },
      {
        id: "isInterstate",
        question: "Do you supply goods/services across state borders?",
        type: "radio",
        required: true,
        options: ["Yes, Interstate Supply", "No, Within Same State Only"],
      },
      {
        id: "existingGstin",
        question: "Do you hold any existing GSTIN in other states?",
        type: "text",
        required: false,
        placeholder: "Enter 15-digit GSTIN if applicable",
      },
    ],
    documents: [
      { name: "PAN Card of Business / Proprietor", description: "Clear scanned copy of PAN", required: true, category: "GST" },
      { name: "Aadhaar Card of Promoters", description: "Both front and back side", required: true, category: "GST" },
      { name: "Place of Business Proof", description: "Electricity bill (< 2 months old) or Municipal tax receipt", required: true, category: "GST" },
      { name: "Rent Agreement / NOC", description: "NOC from property owner if rented/leased", required: true, category: "GST" },
      { name: "Bank Account Proof", description: "Cancelled cheque, bank statement, or passbook front page", required: true, category: "BANKING" },
    ],
  },
  "private-limited-company-registration": {
    questions: [
      {
        id: "proposedNames",
        question: "Proposed Company Names (in order of preference)",
        type: "textarea",
        required: true,
        placeholder: "1. Preferred Name Pvt Ltd\n2. Alternate Name Pvt Ltd",
        helpText: "Provide 2 distinct names ending with 'Private Limited'.",
      },
      {
        id: "directorsCount",
        question: "Number of Directors",
        type: "dropdown",
        required: true,
        options: ["2 Directors", "3 Directors", "4 Directors", "5+ Directors"],
      },
      {
        id: "authorizedCapital",
        question: "Proposed Authorized Capital",
        type: "dropdown",
        required: true,
        options: ["₹1,00,000 (Standard)", "₹5,00,000", "₹10,00,000", "₹50,00,000+"],
      },
      {
        id: "businessObjective",
        question: "Main Business Objects (MOA Purpose)",
        type: "textarea",
        required: true,
        placeholder: "Describe the primary commercial activities the company will carry out...",
      },
    ],
    documents: [
      { name: "PAN Card of all Directors", description: "Mandatory for Indian nationals", required: true, category: "INCORPORATION" },
      { name: "Identity Proof of all Directors", description: "Passport, Voter ID, or Driving License", required: true, category: "INCORPORATION" },
      { name: "Address Proof of all Directors", description: "Bank statement, electricity bill (< 2 months old)", required: true, category: "INCORPORATION" },
      { name: "Registered Office Address Proof", description: "Electricity bill & Rent Agreement / NOC", required: true, category: "INCORPORATION" },
      { name: "Director Photographs", description: "Passport size photo of each director", required: true, category: "INCORPORATION" },
    ],
  },
  "virtual-cfo-advisory": {
    questions: [
      {
        id: "annualTurnover",
        question: "Current Annual Turnover / Run Rate",
        type: "dropdown",
        required: true,
        options: ["Pre-Revenue / Seed Stage", "₹50 Lakhs - ₹2 Crores", "₹2 Crores - ₹10 Crores", "₹10 Crores - ₹50 Crores", "₹50 Crores+"],
      },
      {
        id: "accountingSoftware",
        question: "Primary Accounting Software in Use",
        type: "dropdown",
        required: true,
        options: ["Tally Prime", "Zoho Books", "QuickBooks", "SAP / Oracle", "Excel / Manual", "Other"],
      },
      {
        id: "primaryObjectives",
        question: "Key CFO Priorities",
        type: "checkbox",
        required: true,
        options: [
          "13-Week Rolling Cash Flow Management",
          "Unit Economics & Margin Optimization",
          "Fundraising & Investor Due Diligence",
          "Budgeting & Working Capital Control",
          "Executive MIS & Board Reporting",
        ],
      },
      {
        id: "additionalNotes",
        question: "Any specific challenges or upcoming funding milestones?",
        type: "textarea",
        required: false,
        placeholder: "Tell our CFO advisory lead about your burn rate, runway, or upcoming milestones...",
      },
    ],
    documents: [
      { name: "Last 2 Years Financial Statements", description: "Audited Balance Sheet & P&L (if available)", required: false, category: "CFO" },
      { name: "Current Year Trial Balance / MIS", description: "Latest trial balance or monthly P&L", required: false, category: "CFO" },
    ],
  },
  "default": {
    questions: [
      {
        id: "natureOfRequirement",
        question: "Describe your specific service requirements",
        type: "textarea",
        required: true,
        placeholder: "Tell our CA team about your business scope, timeline, and deliverables required...",
      },
      {
        id: "preferredContactTime",
        question: "Preferred Consultation Time",
        type: "dropdown",
        required: false,
        options: ["Morning (10:00 AM - 1:00 PM)", "Afternoon (1:00 PM - 5:00 PM)", "Evening (5:00 PM - 7:30 PM)"],
      },
    ],
    documents: [
      { name: "Business Identity / Registration Proof", description: "PAN / COI / Partnership Deed", required: false, category: "GENERAL" },
      { name: "Supporting Financial Records", description: "Bank statement, invoices, or relevant records", required: false, category: "GENERAL" },
    ],
  },
};

export function getServiceRequirements(slug: string): ServiceRequirementConfig {
  return SERVICE_REQUIREMENTS[slug] || SERVICE_REQUIREMENTS["default"];
}
