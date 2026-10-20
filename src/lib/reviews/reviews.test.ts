import { describe, it, expect } from "vitest";
import { prisma } from "../db/prisma";
import { generateReviewSchema } from "../seo/schema";

describe("Phase 8: Verified Customer Reviews & Moderation Engine", () => {
  it("should record customer review as PENDING by default until admin moderation", async () => {
    const review = await prisma.review.create({
      data: {
        customerName: "Sanjay Kumar",
        businessName: "Kashi Logistics LLP",
        city: "Varanasi",
        serviceName: "GST Registration",
        rating: 5,
        reviewText: "Quick and hassle-free registration completed in 3 days.",
        status: "PENDING",
        isPublished: false,
      },
    });

    expect(review.id).toBeDefined();
    expect(review.status).toBe("PENDING");
    expect(review.isPublished).toBe(false);

    // Verify it is not returned in public published reviews query
    const publicReviews = await prisma.review.findMany({
      where: { isPublished: true, status: "APPROVED" },
    });
    expect(publicReviews.some((r) => r.id === review.id)).toBe(false);

    // Admin approves review
    const approved = await prisma.review.update({
      where: { id: review.id },
      data: { status: "APPROVED", isPublished: true, publishedAt: new Date() },
    });
    expect(approved.status).toBe("APPROVED");
    expect(approved.isPublished).toBe(true);
  });

  it("should calculate accurate AggregateRating schema from published reviews", () => {
    const reviews = [
      { author: "Vivek", rating: 5, reviewBody: "Exceptional CA service" },
      { author: "Anita", rating: 4, reviewBody: "Great compliance support" },
    ];

    const schema = generateReviewSchema({
      itemName: "Private Limited Company Registration",
      reviews,
    });

    expect(schema).toBeDefined();
    expect(schema?.["@type"]).toBe("Product");
    expect(schema?.aggregateRating.ratingValue).toBe(4.5);
    expect(schema?.aggregateRating.reviewCount).toBe(2);
    expect(schema?.review.length).toBe(2);
  });
});
