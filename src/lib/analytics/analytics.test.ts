import { describe, it, expect } from "vitest";
import { extractUtmFromUrl } from "../attribution/utm";
import { prisma } from "../db/prisma";

describe("Phase 8: Analytics & UTM Attribution", () => {
  it("should extract UTM parameters accurately from campaign URL", () => {
    const url = "https://fyntrust.in/services/gst-registration?utm_source=google_ads&utm_medium=cpc&utm_campaign=diwali_msme_tax&utm_term=ca_lucknow";
    const attribution = extractUtmFromUrl(url);

    expect(attribution.utmSource).toBe("google_ads");
    expect(attribution.utmMedium).toBe("cpc");
    expect(attribution.utmCampaign).toBe("diwali_msme_tax");
    expect(attribution.utmTerm).toBe("ca_lucknow");
    expect(attribution.landingPage).toBe("/services/gst-registration");
  });

  it("should determine organic search / social source from referrer header", () => {
    const directUrl = "https://fyntrust.in/how-it-works";
    const googleReferrer = "https://www.google.co.in/search?q=ca+in+lucknow";
    const googleAttribution = extractUtmFromUrl(directUrl, googleReferrer);

    expect(googleAttribution.utmSource).toBe("GOOGLE_ORGANIC");
    expect(googleAttribution.referrer).toBe(googleReferrer);

    const linkedinReferrer = "https://www.linkedin.com/feed/";
    const linkedinAttribution = extractUtmFromUrl(directUrl, linkedinReferrer);
    expect(linkedinAttribution.utmSource).toBe("LINKEDIN");
  });

  it("should record analytics event in DB with privacy protection", async () => {
    const event = await prisma.analyticsEvent.create({
      data: {
        eventName: "SERVICE_VIEW",
        pagePath: "/services/virtual-cfo-services",
        serviceSlug: "virtual-cfo-services",
        city: "Lucknow",
        utmSource: "GOOGLE_ORGANIC",
        utmMedium: "organic",
        propertiesJson: JSON.stringify({ device: "desktop", planSelected: "GROWTH" }),
      },
    });

    expect(event.id).toBeDefined();
    expect(event.eventName).toBe("SERVICE_VIEW");
    expect(event.serviceSlug).toBe("virtual-cfo-services");
    expect(event.city).toBe("Lucknow");
  });
});
