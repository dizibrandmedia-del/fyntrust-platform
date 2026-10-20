import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { TOOLS_LIST } from "@/lib/tools/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fyntrust.in";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/locations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/business-compliance-checkup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/business-health-check`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    // 1. Published Services
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const serviceUrls: MetadataRoute.Sitemap = services.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    // 2. Service Categories
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${baseUrl}/services/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 3. Active Cities
    const cities = await prisma.city.findMany({
      where: { isActive: true, status: "ACTIVE" },
      select: { slug: true, createdAt: true },
    });

    const cityUrls: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${baseUrl}/ca-services/${city.slug}`,
      lastModified: city.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 4. Published City + Service pages (Thin content protection: only published & indexable)
    const cityServices = await prisma.cityServicePage.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const cityServiceUrls: MetadataRoute.Sitemap = cityServices.map((cs) => ({
      url: `${baseUrl}/ca-services/${cs.slug}`,
      lastModified: cs.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 5. Published Blogs
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    const blogUrls: MetadataRoute.Sitemap = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // 6. Tools
    const toolUrls: MetadataRoute.Sitemap = TOOLS_LIST.map((t) => ({
      url: `${baseUrl}/tools/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [
      ...staticRoutes,
      ...serviceUrls,
      ...categoryUrls,
      ...cityUrls,
      ...cityServiceUrls,
      ...blogUrls,
      ...toolUrls,
    ];
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
    return staticRoutes;
  }
}
