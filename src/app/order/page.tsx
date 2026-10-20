"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { getServiceRequirements, ServiceQuestion } from "@/lib/orders/requirements";
import {
  ShieldCheck,
  Building2,
  FileCheck,
  CheckCircle2,
  UploadCloud,
  Trash2,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Download,
  AlertCircle,
  PhoneCall,
  Check,
} from "lucide-react";

function SmartOrderWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const serviceSlug = searchParams.get("service") || "gst-registration";
  const initialPackageId = searchParams.get("package") || "";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [service, setService] = useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPackageId);
  const [userSession, setUserSession] = useState<any>(null);
  const [orderDraftId, setOrderDraftId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Form State: Step 1 Business Details
  const [businessDetails, setBusinessDetails] = useState({
    fullName: "",
    mobile: "",
    email: "",
    businessName: "",
    businessType: "Private Limited",
    city: "",
    state: "Uttar Pradesh",
    gstNumber: "",
    panNumber: "",
  });

  // Form State: Step 2 Dynamic Requirements
  const [requirementAnswers, setRequirementAnswers] = useState<Record<string, any>>({});

  // Form State: Step 3 Documents
  const [uploadedDocuments, setUploadedDocuments] = useState<
    { name: string; documentId: string; fileUrl: string; fileName: string }[]
  >([]);
  const [uploadingDocName, setUploadingDocName] = useState<string | null>(null);

  // Pricing State: Step 4
  const [pricing, setPricing] = useState<{
    basePrice: number;
    taxAmount: number;
    totalAmount: number;
    isCustomQuote: boolean;
  }>({
    basePrice: 0,
    taxAmount: 0,
    totalAmount: 0,
    isCustomQuote: false,
  });

  // Payment State: Step 5
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");

  const [pageLoading, setPageLoading] = useState(true);
  const [stepError, setStepError] = useState<string | null>(null);

  const requirementsConfig = getServiceRequirements(serviceSlug);

  // 1. Initial Load: Fetch Session & Service details
  useEffect(() => {
    async function loadData() {
      try {
        setPageLoading(true);

        // Fetch User Session
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.data?.session) {
            setUserSession(authData.data.session);
            const user = authData.data.user;
            setBusinessDetails((prev) => ({
              ...prev,
              fullName: user.fullName || "",
              email: user.email || "",
              mobile: user.mobile || "",
              businessName: user.customerProfile?.businessName || "",
              businessType: user.customerProfile?.businessType || "Private Limited",
              city: user.customerProfile?.city || "",
              state: user.customerProfile?.state || "Uttar Pradesh",
              gstNumber: user.customerProfile?.gstNumber || "",
              panNumber: user.customerProfile?.panNumber || "",
            }));
          }
        }

        // Fetch Services
        const serviceRes = await fetch("/api/health"); // check connectivity
        // Direct mock fallback if loading standalone
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setPageLoading(false);
      }
    }
    loadData();
  }, []);

  // Update Pricing when package or service changes
  useEffect(() => {
    let base = 499;
    if (serviceSlug === "private-limited-company-registration") base = 6999;
    if (serviceSlug === "virtual-cfo-advisory") base = 10000;
    if (serviceSlug === "monthly-bookkeeping-accounting") base = 2999;
    if (serviceSlug === "annual-roc-filing-company") base = 4999;

    const tax = Math.round(base * 0.18);
    setPricing({
      basePrice: base,
      taxAmount: tax,
      totalAmount: base + tax,
      isCustomQuote: false,
    });
  }, [serviceSlug, selectedPackageId]);

  // Handle Step 1 -> Step 2
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    if (!businessDetails.fullName || !businessDetails.mobile) {
      setStepError("Please provide your Full Name and Mobile Number to continue.");
      return;
    }

    // Auto-login or register guest session if needed
    if (!userSession) {
      try {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: businessDetails.fullName,
            mobile: businessDetails.mobile,
            email: businessDetails.email || `client_${businessDetails.mobile}@fyntrust.in`,
            password: `Fyn@${businessDetails.mobile.slice(-4)}2026`,
            businessName: businessDetails.businessName || "My Business",
            businessType: businessDetails.businessType,
            city: businessDetails.city,
            state: businessDetails.state,
          }),
        });
        if (regRes.ok) {
          const regData = await regRes.json();
          setUserSession(regData.data?.session);
        }
      } catch (e) {
        console.warn("Guest onboarding:", e);
      }
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Step 2 -> Step 3
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    // Validate required questions
    for (const q of requirementsConfig.questions) {
      if (q.required && !requirementAnswers[q.id]) {
        setStepError(`Please answer: "${q.question}"`);
        return;
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Document Upload
  const handleFileUpload = async (
    docName: string,
    category: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocName(docName);
    setStepError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentName", docName);
      formData.append("category", category);
      if (orderDraftId) formData.append("orderId", orderDraftId);

      const res = await fetch("/api/orders/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to upload document");
      }

      setUploadedDocuments((prev) => [
        ...prev.filter((d) => d.name !== docName),
        {
          name: docName,
          documentId: data.data.id,
          fileUrl: data.data.fileUrl,
          fileName: file.name,
        },
      ]);
    } catch (err: any) {
      setStepError(err.message || "Failed to upload file");
    } finally {
      setUploadingDocName(null);
    }
  };

  // Handle Document Delete
  const handleDocumentDelete = async (docId: string, docName: string) => {
    try {
      await fetch(`/api/orders/document/${docId}`, { method: "DELETE" });
      setUploadedDocuments((prev) => prev.filter((d) => d.name !== docName));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Handle Step 3 -> Step 4
  const handleStep3Submit = async () => {
    setStepError(null);

    // Check mandatory documents
    const requiredDocs = requirementsConfig.documents.filter((d) => d.required);
    const missingDocs = requiredDocs.filter(
      (reqDoc) => !uploadedDocuments.some((up) => up.name === reqDoc.name)
    );

    if (missingDocs.length > 0) {
      setStepError(
        `Please upload the required document: ${missingDocs.map((d) => d.name).join(", ")}`
      );
      return;
    }

    // Save Order Draft to Backend
    try {
      const res = await fetch("/api/orders/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: serviceSlug, // route uses serviceSlug/id resolution
          businessDetails,
          requirementData: requirementAnswers,
          orderId: orderDraftId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setOrderDraftId(data.data.orderId);
        setOrderNumber(data.data.orderNumber);
      }
    } catch (e) {
      console.warn("Draft save:", e);
    }

    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Step 4 -> Step 5
  const handleStep4Submit = () => {
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Step 5: Payment Execution
  const handlePaymentExecution = async () => {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // 1. Initiate Gateway Order
      const initRes = await fetch("/api/orders/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderDraftId,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        throw new Error(initData.error?.message || "Failed to initialize payment");
      }

      // 2. Perform Backend Payment Verification (Mock / Gateway Signature)
      const verifyRes = await fetch("/api/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderDraftId,
          gatewayOrderId: initData.data.gatewayOrderId,
          gatewayPaymentId: `pay_${Date.now()}_mock`,
          gatewaySignature: "sig_fyntrust_verified_mock",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error?.message || "Payment verification failed");
      }

      setConfirmedOrder(verifyData.data);
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setPaymentError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Business" },
    { num: 2, label: "Requirements" },
    { num: 3, label: "Documents" },
    { num: 4, label: "Review" },
    { num: 5, label: "Payment" },
    { num: 6, label: "Confirmed" },
  ];

  return (
    <div className="py-12 px-4 sm:px-8 max-w-4xl mx-auto space-y-10 font-body">
      {/* Stepper Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-fyn-slate-border shadow-sm">
        <div className="flex items-center justify-between">
          {stepsList.map((st, idx) => (
            <React.Fragment key={st.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    currentStep === st.num
                      ? "bg-[#01574F] text-white shadow-md ring-4 ring-[#78BB69]/30"
                      : currentStep > st.num
                      ? "bg-[#78BB69] text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold ${
                    currentStep >= st.num ? "text-fyn-slate" : "text-slate-400"
                  }`}
                >
                  {st.label}
                </span>
              </div>

              {idx < stepsList.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > idx + 1 ? "bg-[#78BB69]" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {stepError && <Alert variant="error">{stepError}</Alert>}

      {/* ============================================================
          STEP 1: BUSINESS DETAILS
          ============================================================ */}
      {currentStep === 1 && (
        <Card variant="default" className="p-8 sm:p-10 space-y-6 shadow-sm border-fyn-slate-border">
          <div className="border-b border-fyn-slate-border pb-4">
            <Badge variant="primary">Step 01 of 06</Badge>
            <h2 className="text-2xl font-bold font-heading text-fyn-slate mt-2">
              Primary Business & Contact Details
            </h2>
            <p className="text-xs text-fyn-slate-muted">
              Enter your official entity details. These will be used for statutory filings and invoicing.
            </p>
          </div>

          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name of Primary Applicant"
                required
                placeholder="e.g. Ramesh Kumar"
                value={businessDetails.fullName}
                onChange={(e) => setBusinessDetails({ ...businessDetails, fullName: e.target.value })}
              />
              <Input
                label="10-Digit Mobile Number"
                required
                type="tel"
                placeholder="e.g. 9876543210"
                value={businessDetails.mobile}
                onChange={(e) => setBusinessDetails({ ...businessDetails, mobile: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Email Address"
                required
                type="email"
                placeholder="e.g. ramesh@company.com"
                value={businessDetails.email}
                onChange={(e) => setBusinessDetails({ ...businessDetails, email: e.target.value })}
              />
              <Input
                label="Registered Business / Enterprise Name"
                placeholder="e.g. Acme Innovations Pvt Ltd"
                value={businessDetails.businessName}
                onChange={(e) => setBusinessDetails({ ...businessDetails, businessName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Business Entity Type"
                value={businessDetails.businessType}
                onChange={(e) => setBusinessDetails({ ...businessDetails, businessType: e.target.value })}
                options={[
                  { label: "Private Limited Company", value: "Private Limited" },
                  { label: "Limited Liability Partnership (LLP)", value: "LLP" },
                  { label: "Sole Proprietorship", value: "Proprietorship" },
                  { label: "Partnership Firm", value: "Partnership" },
                  { label: "One Person Company (OPC)", value: "OPC" },
                  { label: "Pre-Incorporation / Startup", value: "Startup" },
                ]}
              />
              <Input
                label="City"
                required
                placeholder="e.g. Lucknow"
                value={businessDetails.city}
                onChange={(e) => setBusinessDetails({ ...businessDetails, city: e.target.value })}
              />
              <Input
                label="State"
                required
                placeholder="e.g. Uttar Pradesh"
                value={businessDetails.state}
                onChange={(e) => setBusinessDetails({ ...businessDetails, state: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Existing GSTIN (If any)"
                placeholder="15-digit GSTIN (Optional)"
                value={businessDetails.gstNumber}
                onChange={(e) => setBusinessDetails({ ...businessDetails, gstNumber: e.target.value })}
              />
              <Input
                label="Business PAN (If any)"
                placeholder="10-digit PAN (Optional)"
                value={businessDetails.panNumber}
                onChange={(e) => setBusinessDetails({ ...businessDetails, panNumber: e.target.value })}
              />
            </div>

            <div className="pt-6 border-t border-fyn-slate-border flex justify-end">
              <Button type="submit" variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Requirements
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ============================================================
          STEP 2: DYNAMIC SERVICE REQUIREMENTS QUESTIONNAIRE
          ============================================================ */}
      {currentStep === 2 && (
        <Card variant="default" className="p-8 sm:p-10 space-y-6 shadow-sm border-fyn-slate-border">
          <div className="border-b border-fyn-slate-border pb-4">
            <Badge variant="primary">Step 02 of 06</Badge>
            <h2 className="text-2xl font-bold font-heading text-fyn-slate mt-2">
              Service Requirements & Scope
            </h2>
            <p className="text-xs text-fyn-slate-muted">
              Answer the following specific questions to help our CA team structure your filing accurately.
            </p>
          </div>

          <form onSubmit={handleStep2Submit} className="space-y-5">
            {requirementsConfig.questions.map((q: ServiceQuestion) => (
              <div key={q.id} className="space-y-2">
                {q.type === "dropdown" && (
                  <Select
                    label={q.question + (q.required ? " *" : "")}
                    value={requirementAnswers[q.id] || ""}
                    onChange={(e) =>
                      setRequirementAnswers({ ...requirementAnswers, [q.id]: e.target.value })
                    }
                    options={[
                      { label: "-- Select an option --", value: "" },
                      ...(q.options || []).map((opt) => ({ label: opt, value: opt })),
                    ]}
                  />
                )}

                {q.type === "radio" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-fyn-slate block">
                      {q.question} {q.required && "*"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(q.options || []).map((opt) => (
                        <label
                          key={opt}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                            requirementAnswers[q.id] === opt
                              ? "border-[#01574F] bg-[#E6F0EF] font-bold text-[#01574F]"
                              : "border-fyn-slate-border hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={requirementAnswers[q.id] === opt}
                            onChange={() =>
                              setRequirementAnswers({ ...requirementAnswers, [q.id]: opt })
                            }
                            className="text-[#01574F]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === "textarea" && (
                  <Textarea
                    label={q.question + (q.required ? " *" : "")}
                    placeholder={q.placeholder}
                    value={requirementAnswers[q.id] || ""}
                    onChange={(e) =>
                      setRequirementAnswers({ ...requirementAnswers, [q.id]: e.target.value })
                    }
                  />
                )}

                {q.type === "text" && (
                  <Input
                    label={q.question + (q.required ? " *" : "")}
                    placeholder={q.placeholder}
                    value={requirementAnswers[q.id] || ""}
                    onChange={(e) =>
                      setRequirementAnswers({ ...requirementAnswers, [q.id]: e.target.value })
                    }
                  />
                )}

                {q.helpText && <p className="text-[11px] text-fyn-slate-muted">{q.helpText}</p>}
              </div>
            ))}

            <div className="pt-6 border-t border-fyn-slate-border flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button type="submit" variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Documents
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ============================================================
          STEP 3: DOCUMENT COLLECTION
          ============================================================ */}
      {currentStep === 3 && (
        <Card variant="default" className="p-8 sm:p-10 space-y-6 shadow-sm border-fyn-slate-border">
          <div className="border-b border-fyn-slate-border pb-4">
            <Badge variant="primary">Step 03 of 06</Badge>
            <h2 className="text-2xl font-bold font-heading text-fyn-slate mt-2">
              Required Documents Vault
            </h2>
            <p className="text-xs text-fyn-slate-muted">
              Upload clear PDF or JPG copies into your encrypted client vault.
            </p>
          </div>

          <div className="space-y-4">
            {requirementsConfig.documents.map((doc) => {
              const isUploaded = uploadedDocuments.find((u) => u.name === doc.name);
              const isCurrentlyUploading = uploadingDocName === doc.name;

              return (
                <div
                  key={doc.name}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isUploaded
                      ? "border-[#78BB69] bg-[#E6F7ED]/40"
                      : "border-fyn-slate-border bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-fyn-slate font-heading">{doc.name}</span>
                      {doc.required ? (
                        <Badge variant="danger" size="sm">Required</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Optional</Badge>
                      )}
                    </div>
                    <p className="text-xs text-fyn-slate-muted">{doc.description}</p>
                    {isUploaded && (
                      <span className="text-[11px] font-semibold text-[#0E7C3A] block">
                        ✓ Uploaded: {isUploaded.fileName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isUploaded ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDocumentDelete(isUploaded.documentId, doc.name)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Remove
                      </Button>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          disabled={isCurrentlyUploading}
                          onChange={(e) => handleFileUpload(doc.name, doc.category, e)}
                        />
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#01574F] text-white hover:bg-[#142A2B] transition-colors shadow-sm">
                          {isCurrentlyUploading ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4" />
                              <span>Upload File</span>
                            </>
                          )}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-fyn-slate-border flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleStep3Submit}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Review & Pricing
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================
          STEP 4: REVIEW & PRICING
          ============================================================ */}
      {currentStep === 4 && (
        <Card variant="executive" className="p-8 sm:p-10 space-y-6 shadow-md border-fyn-slate-border">
          <div className="border-b border-fyn-slate-border pb-4">
            <Badge variant="accent">Step 04 of 06</Badge>
            <h2 className="text-2xl font-bold font-heading text-fyn-slate mt-2">
              Review Order & Pricing Breakdown
            </h2>
            <p className="text-xs text-fyn-slate-muted">
              Verify all details before initiating payment. An official tax invoice will be generated upon completion.
            </p>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-fyn-slate-border space-y-2">
              <span className="font-bold text-fyn-primary uppercase tracking-wider block">Applicant Details</span>
              <div><strong>Name:</strong> {businessDetails.fullName}</div>
              <div><strong>Mobile:</strong> +91 {businessDetails.mobile}</div>
              <div><strong>Email:</strong> {businessDetails.email}</div>
              <div><strong>Entity:</strong> {businessDetails.businessName || "New Entity"} ({businessDetails.businessType})</div>
              <div><strong>Location:</strong> {businessDetails.city}, {businessDetails.state}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-fyn-slate-border space-y-2">
              <span className="font-bold text-fyn-primary uppercase tracking-wider block">Documents Uploaded</span>
              <div><strong>Total Files:</strong> {uploadedDocuments.length} files attached to vault</div>
              <ul className="space-y-1 text-[11px] text-fyn-slate-muted">
                {uploadedDocuments.map((d) => (
                  <li key={d.name} className="flex items-center gap-1.5 text-[#0E7C3A]">
                    <Check className="w-3.5 h-3.5" />
                    <span>{d.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="p-6 rounded-2xl bg-white border border-fyn-slate-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-fyn-slate">Professional Service Fee (Base):</span>
              <span className="font-bold text-fyn-slate">{formatCurrency(pricing.basePrice)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-fyn-slate">Applicable GST (18% Statutory):</span>
              <span className="font-bold text-fyn-slate">{formatCurrency(pricing.taxAmount)}</span>
            </div>
            <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between">
              <span className="text-sm font-bold text-fyn-slate font-heading">Total Payable Amount:</span>
              <span className="text-2xl font-extrabold text-[#01574F] font-heading">
                {formatCurrency(pricing.totalAmount)}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-fyn-slate-border flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Edit Documents
            </Button>
            <Button
              type="button"
              variant="accent"
              size="lg"
              className="font-bold shadow-lg"
              onClick={handleStep4Submit}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Payment
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================
          STEP 5: PAYMENT GATEWAY
          ============================================================ */}
      {currentStep === 5 && (
        <Card variant="default" className="p-8 sm:p-10 space-y-6 shadow-md border-fyn-slate-border">
          <div className="border-b border-fyn-slate-border pb-4">
            <Badge variant="primary">Step 05 of 06</Badge>
            <h2 className="text-2xl font-bold font-heading text-fyn-slate mt-2">
              Select Payment Method
            </h2>
            <p className="text-xs text-fyn-slate-muted">
              Complete your payment securely via 256-bit encrypted gateway.
            </p>
          </div>

          {paymentError && <Alert variant="error">{paymentError}</Alert>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "UPI", name: "Instant UPI", desc: "GPay, PhonePe, Paytm, BHIM", icon: CreditCard },
              { id: "CARD", name: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
              { id: "NET_BANKING", name: "Net Banking", desc: "All Indian Banks", icon: Building2 },
            ].map((pm) => (
              <div
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  paymentMethod === pm.id
                    ? "border-[#01574F] bg-[#E6F0EF] shadow-sm"
                    : "border-fyn-slate-border hover:border-slate-300"
                }`}
              >
                <div className="font-bold text-sm text-fyn-slate font-heading">{pm.name}</div>
                <p className="text-[11px] text-fyn-slate-muted">{pm.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-fyn-slate-border flex items-center justify-between text-xs">
            <span className="text-fyn-slate-muted">Order Total (Including 18% GST):</span>
            <span className="font-bold text-lg text-[#01574F] font-heading">
              {formatCurrency(pricing.totalAmount)}
            </span>
          </div>

          <div className="pt-6 border-t border-fyn-slate-border flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setCurrentStep(4)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="font-bold shadow-xl px-8"
              isLoading={paymentLoading}
              onClick={handlePaymentExecution}
            >
              Pay {formatCurrency(pricing.totalAmount)} & Activate Order
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================
          STEP 6: ORDER CONFIRMATION & INVOICE
          ============================================================ */}
      {currentStep === 6 && confirmedOrder && (
        <Card variant="executive" className="text-center p-8 sm:p-12 space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-[#78BB69]/20 text-[#78BB69] rounded-full flex items-center justify-center mx-auto border border-[#78BB69]/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <Badge variant="accent">Order Confirmed & Activated</Badge>
            <h1 className="text-3xl font-bold font-heading text-fyn-slate">
              Thank You! Your Service Order Has Been Placed.
            </h1>
            <p className="text-xs sm:text-sm text-fyn-slate-muted max-w-lg mx-auto">
              Our central CA operations desk has received your payment and document vault.
              An assigned Chartered Accountant will verify your records and initiate statutory filing.
            </p>
          </div>

          {/* Confirmation Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-fyn-slate-border max-w-md mx-auto text-left text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-fyn-slate-border pb-2">
              <span className="text-fyn-slate-muted">Order ID:</span>
              <span className="font-extrabold text-fyn-primary font-heading text-sm">
                {confirmedOrder.orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-fyn-slate-border pb-2">
              <span className="text-fyn-slate-muted">Invoice Number:</span>
              <span className="font-bold text-fyn-slate">
                {confirmedOrder.invoiceNumber}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-fyn-slate-border pb-2">
              <span className="text-fyn-slate-muted">Payment Status:</span>
              <span className="font-bold text-[#0E7C3A] uppercase">PAID & VERIFIED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fyn-slate-muted">Total Amount Paid:</span>
              <span className="font-bold text-sm text-[#01574F]">
                {formatCurrency(confirmedOrder.totalAmount)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={`/api/invoices/${confirmedOrder.invoiceNumber}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="md" className="w-full" leftIcon={<Download className="w-4 h-4 text-fyn-primary" />}>
                Download Tax Invoice (PDF/HTML)
              </Button>
            </a>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function SmartOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Initializing smart order workflow..." />
        </div>
      }
    >
      <SmartOrderWizard />
    </Suspense>
  );
}
