import { describe, it, expect } from "vitest";
import { constructMetadata } from "./metadata";
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateServiceSchema,
  generateFaqSchema,
  generateReviewSchema,
  FYNTRUST_BUSINESS_INFO,
} from "./schema";
import { resolveRedirect, createSafeRedirect } from "../redirects/redirect-engine";
import { prisma } from "../db/prisma";

describe("Phase 8: SEO Architecture & Structured Data", () => {
  it("should construct valid SEO metadata with canonical and robots directives", () => {
    const meta = constructMetadata({
      title: "GST Registration in Lucknow",
      description: "Fast online GST registration by top Chartered Accountants.",
      canonical: "/ca-services/lucknow/gst-registration",
      robots: { index: true, follow: true },
    });

    expect(meta.title).toBe("GST Registration in Lucknow | Fyntrust");
    expect(meta.description).toBe("Fast online GST registration by top Chartered Accountants.");
    expect(meta.alternates?.canonical).toBe("https://fyntrust.in/ca-services/lucknow/gst-registration");
    expect((meta.robots as any)?.index).toBe(true);
    expect((meta.robots as any)?.follow).toBe(true);
  });

  it("should generate accurate Organization schema using official Fyntrust corporate details", () => {
    const org = generateOrganizationSchema();
    expect(org["@type"]).toBe("FinancialService");
    expect(org.name).toBe("Fyntrust Business Advisory Services");
    expect(org.telephone).toBe("+91 9118066449");
    expect(org.email).toBe("team@fyntrust.in");
    expect(org.address.length).toBeGreaterThanOrEqual(2);
    expect(org.address[0].addressLocality).toBe("Lucknow");
    expect(org.address[1].addressLocality).toBe("Ghazipur");
  });

  it("should generate hierarchical BreadcrumbList schema", () => {
    const breadcrumbs = generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "CA Services", url: "/locations" },
      { name: "Lucknow", url: "/ca-services/lucknow" },
    ]);

    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement.length).toBe(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);
    expect(breadcrumbs.itemListElement[2].name).toBe("Lucknow");
  });

  it("should generate valid Service schema and offer pricing", () => {
    const srv = generateServiceSchema({
      name: "Private Limited Company Registration",
      description: "Fast MCA SPICe+ incorporation with DIN, PAN, TAN.",
      url: "/services/private-limited-company-registration",
      startingPrice: 6999,
    });

    expect(srv["@type"]).toBe("Service");
    expect(srv.name).toBe("Private Limited Company Registration");
    expect(srv.offers.price).toBe(6999);
    expect(srv.offers.priceCurrency).toBe("INR");
  });

  it("should only generate FAQ schema when visible FAQs exist", () => {
    const emptyFaq = generateFaqSchema([]);
    expect(emptyFaq).toBeNull();

    const validFaq = generateFaqSchema([
      { q: "What is the turnaround time?", a: "3 business days." },
    ]);
    expect(validFaq?.["@type"]).toBe("FAQPage");
    expect(validFaq?.mainEntity.length).toBe(1);
    expect(validFaq?.mainEntity[0].name).toBe("What is the turnaround time?");
  });

  it("should enforce safe 301 redirects and prevent circular loops and open redirects", async () => {
    // 1. Valid redirect
    await createSafeRedirect("/old-tax-page", "/services/income-tax-return-filing", 301);
    const resolved = await resolveRedirect("/old-tax-page");
    expect(resolved?.destination).toBe("/services/income-tax-return-filing");
    expect(resolved?.statusCode).toBe(301);

    // 2. Circular self-redirect should throw error
    await expect(createSafeRedirect("/loop", "/loop")).rejects.toThrow(
      "Source and destination URLs cannot be identical"
    );

    // 3. Open redirect / malicious protocol should throw error
    await expect(createSafeRedirect("/bad", "javascript:alert(1)")).rejects.toThrow(
      "Unsafe destination protocol"
    );
  });
});
