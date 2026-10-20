import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["SUPER_ADMIN", "ADMIN"]);

    const pages = await prisma.sEOPages.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        city: { select: { name: true, slug: true } },
        service: { select: { name: true, slug: true } },
      },
    });

    return apiSuccess({ pages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const {
      pageType,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      robotsIndex = true,
      robotsFollow = true,
      schemaType = "WebPage",
      primaryKeyword,
      secondaryKeywords,
      sitemapIncluded = true,
      cityId,
      serviceId,
    } = body;

    if (!slug || !metaTitle || !metaDescription) {
      throw new Error("Slug, Meta Title, and Meta Description are required");
    }

    const page = await prisma.sEOPages.upsert({
      where: { slug },
      update: {
        pageType,
        metaTitle,
        metaDescription,
        keywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        robotsIndex,
        robotsFollow,
        schemaType,
        primaryKeyword,
        secondaryKeywords,
        sitemapIncluded,
        cityId: cityId || null,
        serviceId: serviceId || null,
      },
      create: {
        pageType: pageType || "CUSTOM",
        slug,
        metaTitle,
        metaDescription,
        keywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        robotsIndex,
        robotsFollow,
        schemaType,
        primaryKeyword,
        secondaryKeywords,
        sitemapIncluded,
        cityId: cityId || null,
        serviceId: serviceId || null,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "Service",
      entityId: page.id,
      newValue: { slug, metaTitle },
    });

    return apiSuccess({ page });
  } catch (error) {
    return handleApiError(error);
  }
}
