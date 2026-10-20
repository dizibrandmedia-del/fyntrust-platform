import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { TOOLS_LIST, RESOURCE_ARTICLES } from "@/lib/tools/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({
        success: true,
        data: {
          services: [],
          tools: [],
          cities: [],
          articles: [],
        },
      });
    }

    // 1. Services search
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { shortDescription: { contains: q } },
          { fullDescription: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        startingPrice: true,
      },
      take: 6,
    });

    // 2. Tools search
    const tools = TOOLS_LIST.filter(
      (t) =>
        t.title.toLowerCase().includes(q.toLowerCase()) ||
        t.description.toLowerCase().includes(q.toLowerCase()) ||
        t.category.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);

    // 3. Cities search
    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { state: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        state: true,
        shortDescription: true,
      },
      take: 6,
    });

    // 4. Articles search
    const articles = RESOURCE_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q.toLowerCase()) ||
        a.desc.toLowerCase().includes(q.toLowerCase()) ||
        a.category.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);

    return NextResponse.json({
      success: true,
      data: {
        services,
        tools,
        cities,
        articles,
      },
    });
  } catch (error) {
    console.error("Search API failed:", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
