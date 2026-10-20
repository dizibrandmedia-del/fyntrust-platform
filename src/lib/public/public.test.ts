import { describe, it, expect } from "vitest";
import { prisma } from "../db/prisma";
import { createLeadSchema } from "../security/validation";

describe("Phase 2 Public Website & CMS Data Tests", () => {
  it("should verify all 7 core practice categories exist in CMS", async () => {
    const categories = await prisma.serviceCategory.findMany();
    expect(categories.length).toBe(7);

    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("business-registration");
    expect(slugs).toContain("tax-services");
    expect(slugs).toContain("accounting-finance");
    expect(slugs).toContain("payroll-compliance");
    expect(slugs).toContain("mca-roc-compliance");
    expect(slugs).toContain("virtual-cfo");
    expect(slugs).toContain("legal-support");
  });

  it("should verify active corporate services with packages and SLAs", async () => {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { category: true, packages: true },
    });

    expect(services.length).toBeGreaterThanOrEqual(10);

    const gst = services.find((s) => s.slug === "gst-registration");
    expect(gst).toBeDefined();
    expect(gst?.startingPrice).toBe(499);
    expect(gst?.packages.length).toBeGreaterThan(0);

    const vcfo = services.find((s) => s.slug === "virtual-cfo-advisory");
    expect(vcfo).toBeDefined();
    expect(vcfo?.startingPrice).toBe(10000);
  });

  it("should verify PAN India cities for SEO routing", async () => {
    const cities = await prisma.city.findMany();
    expect(cities.length).toBeGreaterThanOrEqual(10);

    const lucknow = cities.find((c) => c.slug === "lucknow");
    expect(lucknow).toBeDefined();
    expect(lucknow?.state).toBe("Uttar Pradesh");
  });

  it("should validate Lead creation schema from contact and get-started forms", () => {
    const validLead = {
      name: "Rohan Khanna",
      mobile: "9876543210",
      email: "rohan@khanna.in",
      businessName: "Khanna Textiles",
      city: "Varanasi",
      businessType: "Private Limited",
      notes: "Need GST registration and filing",
      source: "WEBSITE",
    };

    const parsed = createLeadSchema.safeParse(validLead);
    expect(parsed.success).toBe(true);

    const getStartedLead = {
      name: "DiziBrand Team",
      mobile: "8209962228",
      email: "dizibrandmedia@gmail.com",
      businessName: "Reeya Services",
      city: "AZAMGARH",
      businessType: "Private Limited",
      notes: "[Initiated Service: GST Registration] [Package: ] hello",
      source: "GET_STARTED_FLOW",
    };

    const getStartedParsed = createLeadSchema.safeParse(getStartedLead);
    expect(getStartedParsed.success).toBe(true);

    const invalidLead = {
      name: "R", // too short
      mobile: "123", // invalid mobile
    };

    const failed = createLeadSchema.safeParse(invalidLead);
    expect(failed.success).toBe(false);
  });

  it("should verify published blog posts and reviews for authentic CMS rendering", async () => {
    const blogs = await prisma.blog.findMany({ where: { isPublished: true } });
    expect(blogs.length).toBeGreaterThanOrEqual(2);

    const reviews = await prisma.review.findMany({ where: { isPublished: true } });
    expect(reviews.length).toBeGreaterThanOrEqual(3);
  });
});
