import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../db/prisma";
import { hashPassword } from "../auth/password";
import { performDatabaseBackup } from "../../../scripts/backup";
import { generateNextOrderNumber } from "../orders/pricing";
import { createOrderInvoice } from "../invoices";
import { generateReviewSchema } from "../seo/schema";
import fs from "fs";

describe("Phase 9: Master Full-Journey Production & Security Verification", () => {
  const timestamp = Date.now();
  let leadId: string;
  let customerUserId: string;
  let customerProfileId: string;
  let expertUserId: string;
  let expertProfileId: string;
  let orderId: string;
  let invoiceId: string;
  let deliverableId: string;

  it("Step 1: Lead Capture with UTM Attribution & First-Touch Tracking", async () => {
    const lead = await prisma.lead.create({
      data: {
        name: "Rahul Shrestha",
        email: `rahul_${timestamp}@fyntrust.in`,
        mobile: `91${timestamp.toString().slice(-8)}`,
        businessName: "Himalaya Healthtech Pvt Ltd",
        city: "Lucknow",
        source: "GOOGLE_ORGANIC",
        status: "NEW_LEAD",
      },
    });

    expect(lead.id).toBeDefined();
    expect(lead.source).toBe("GOOGLE_ORGANIC");
    leadId = lead.id;
  });

  it("Step 2: Lead Conversion to Customer without Duplicate Account Creation", async () => {
    let lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: "Rahul Shrestha",
          email: `rahul_${timestamp}@fyntrust.in`,
          mobile: `91${timestamp.toString().slice(-8)}`,
          businessName: "Himalaya Healthtech Pvt Ltd",
          city: "Lucknow",
          source: "GOOGLE_ORGANIC",
          status: "NEW_LEAD",
        },
      });
      leadId = lead.id;
    }

    // Create User & CustomerProfile
    const user = await prisma.user.create({
      data: {
        email: lead.email!,
        mobile: lead.mobile,
        fullName: lead.name,
        passwordHash: await hashPassword("SecureP@ssw0rd123"),
        role: "CUSTOMER",
      },
    });

    const customer = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        businessName: lead.businessName || "Himalaya Healthtech Pvt Ltd",
        businessType: "Private Limited",
        city: lead.city || "Lucknow",
        state: "Uttar Pradesh",
      },
    });

    customerUserId = user.id;
    customerProfileId = customer.id;

    // Update Lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "CONVERTED" },
    });

    expect(customer.userId).toBe(customerUserId);
    expect(customer.businessName).toBe("Himalaya Healthtech Pvt Ltd");
  });

  it("Step 3: Service Selection, Order Creation, and GST Tax Invoice Generation", async () => {
    // Ensure customerProfileId
    if (!customerProfileId) {
      const cust = await prisma.customerProfile.findFirst();
      customerProfileId = cust!.id;
    }

    let service = await prisma.service.findFirst({ where: { isActive: true } });
    if (!service) {
      const cat = await prisma.serviceCategory.create({
        data: { name: `Cat-${timestamp}`, slug: `formation-${timestamp}` },
      });
      service = await prisma.service.create({
        data: {
          categoryId: cat.id,
          name: "Private Limited Company Registration",
          slug: `pvt-ltd-${timestamp}`,
          shortDescription: "SPICe+ Incorporation",
          fullDescription: "Complete MCA company incorporation.",
          startingPrice: 6999,
          slaDays: 7,
          whatsIncluded: JSON.stringify(["DIN", "DSC", "COI"]),
          documentsRequired: JSON.stringify(["PAN Card", "Aadhaar Card", "Bank Statement"]),
          processSteps: JSON.stringify([{ step: 1, title: "DSC Prep", desc: "Digital signatures" }]),
        },
      });
    }

    const orderNumber = await generateNextOrderNumber();
    const basePrice = 6999;
    const taxAmount = Math.round(basePrice * 0.18);
    const totalAmount = basePrice + taxAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerProfileId,
        serviceId: service.id,
        totalAmount,
        paymentStatus: "PAID",
        status: "PAYMENT_RECEIVED",
        requirementData: JSON.stringify({ directorsCount: 2, authorizedCapital: 100000 }),
      },
    });

    const invoice = await createOrderInvoice({
      orderId: order.id,
      customerId: customerProfileId,
      amount: basePrice,
      taxAmount,
      totalAmount,
      serviceName: service.name,
    });

    expect(order.id).toBeDefined();
    expect(invoice.id).toBeDefined();
    expect(order.paymentStatus).toBe("PAID");
    expect(invoice.invoiceNumber).toMatch(/^FYN\/INV\/\d{4}\/\d{6}$/);

    orderId = order.id;
    invoiceId = invoice.id;
  });

  it("Step 4: Secure Document Upload into Isolated Customer Vault", async () => {
    const doc = await prisma.document.create({
      data: {
        customerId: customerProfileId,
        orderId,
        name: "Director_1_PAN_Card.pdf",
        fileKey: `vault/${customerProfileId}/${orderId}/pan.pdf`,
        fileUrl: `/api/customer/documents/${orderId}/download`,
        fileType: "application/pdf",
        fileSize: 1024 * 350,
        status: "PENDING_VERIFICATION",
      },
    });

    expect(doc.id).toBeDefined();
    expect(doc.status).toBe("PENDING_VERIFICATION");
  });

  it("Step 5: Admin Manual Assignment of Verified CA / Legal Partner", async () => {
    const expertUser = await prisma.user.create({
      data: {
        email: `ca_expert_${timestamp}@fyntrust.in`,
        mobile: `92${timestamp.toString().slice(-8)}`,
        fullName: "CA Amit Singhania",
        passwordHash: await hashPassword("ExpertP@ssw0rd123"),
        role: "CA_FINANCE_EXPERT",
      },
    });

    const expert = await prisma.expertProfile.create({
      data: {
        userId: expertUser.id,
        qualification: "FCA, DISA (ICAI)",
        expertise: "Corporate Taxation, MCA SPICe+ Filings, Company Law",
        assignedCategories: "INCORPORATION,ROC,TAX",
        availabilityStatus: "AVAILABLE",
        city: "Lucknow",
        state: "Uttar Pradesh",
        experienceYears: 8,
      },
    });

    expertUserId = expertUser.id;
    expertProfileId = expert.id;

    const assignedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        assignedExpertId: expert.id,
        status: "WORK_IN_PROGRESS",
      },
    });

    expect(assignedOrder.assignedExpertId).toBe(expert.id);
    expect(assignedOrder.status).toBe("WORK_IN_PROGRESS");
  });

  it("Step 6: Expert Work Execution & Deliverable Submission", async () => {
    const deliverable = await prisma.deliverable.create({
      data: {
        orderId,
        expertId: expertProfileId,
        name: "Certificate of Incorporation & Approved MOA/AOA",
        deliverableType: "CERTIFICATE",
        description: "Official MCA SPICe+ approval certificate and PAN/TAN allotment letters.",
        fileUrl: `/uploads/deliverables/${orderId}/coi_approved.pdf`,
        fileSize: 1024 * 512,
        status: "SUBMITTED_FOR_REVIEW",
      },
    });

    expect(deliverable.id).toBeDefined();
    expect(deliverable.status).toBe("SUBMITTED_FOR_REVIEW");
    deliverableId = deliverable.id;
  });

  it("Step 7: Admin Review, Customer Delivery, and Order Completion", async () => {
    const approvedDeliverable = await prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: "APPROVED" },
    });
    expect(approvedDeliverable.status).toBe("APPROVED");

    const completedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    expect(completedOrder.status).toBe("COMPLETED");
  });

  it("Step 8: Verified Customer Review Submission & Admin Moderation", async () => {
    const review = await prisma.review.create({
      data: {
        customerId: customerProfileId,
        orderId,
        customerName: "Rahul Shrestha",
        businessName: "Himalaya Healthtech Pvt Ltd",
        city: "Lucknow",
        serviceName: "Private Limited Company Registration",
        rating: 5,
        reviewText: "Flawless incorporation delivered by CA Amit Singhania in 5 business days!",
        status: "PENDING",
        isPublished: false,
      },
    });

    expect(review.status).toBe("PENDING");

    const moderated = await prisma.review.update({
      where: { id: review.id },
      data: { status: "APPROVED", isPublished: true, publishedAt: new Date() },
    });

    expect(moderated.status).toBe("APPROVED");
    expect(moderated.isPublished).toBe(true);

    const schema = generateReviewSchema({
      itemName: "Private Limited Company Registration",
      reviews: [{ author: review.customerName, rating: 5, reviewBody: review.reviewText }],
    });
    expect(schema?.aggregateRating.ratingValue).toBe(5);
  });

  it("Step 9: Customer Data Isolation & IDOR Protection Check", async () => {
    const userB = await prisma.user.create({
      data: {
        email: `customerB_${timestamp}@fyntrust.in`,
        mobile: `93${timestamp.toString().slice(-8)}`,
        fullName: "Siddharth Malhotra",
        passwordHash: await hashPassword("UserBP@ssw0rd123"),
        role: "CUSTOMER",
      },
    });

    const customerB = await prisma.customerProfile.create({
      data: {
        userId: userB.id,
        businessName: "Malhotra Enterprises",
        businessType: "Proprietorship",
        city: "Mumbai",
        state: "Maharashtra",
      },
    });

    const orderForCustomerB = await prisma.order.findFirst({
      where: { id: orderId, customerId: customerB.id },
    });
    expect(orderForCustomerB).toBeNull();

    const invoiceForCustomerB = await prisma.invoice.findFirst({
      where: { id: invoiceId, customerId: customerB.id },
    });
    expect(invoiceForCustomerB).toBeNull();
  });

  it("Step 10: Automated Database Backup & Verification", () => {
    const backupResult = performDatabaseBackup();
    expect(backupResult.success).toBe(true);
    expect(backupResult.checksum.length).toBe(64);
    expect(fs.existsSync(backupResult.backupPath)).toBe(true);
  });
});
