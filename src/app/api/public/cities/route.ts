import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
      include: {
        _count: { select: { cityServicePages: true } },
      },
    });

    // Seed default major cities if none exist
    if (cities.length === 0) {
      const defaultCities = [
        { name: "Lucknow", slug: "lucknow", state: "Uttar Pradesh", isPopular: true, shortDescription: "Corporate hub & regional head office in Hazratganj. Expert CA & Tax Advisory for UP businesses." },
        { name: "Delhi", slug: "delhi", state: "Delhi NCR", isPopular: true, shortDescription: "Premier CA services, MCA filings, and Virtual CFO for Delhi NCR corporate enterprises." },
        { name: "Mumbai", slug: "mumbai", state: "Maharashtra", isPopular: true, shortDescription: "Financial capital corporate taxation, SEBI/FDI compliance, and high-growth advisory." },
        { name: "Bengaluru", slug: "bengaluru", state: "Karnataka", isPopular: true, shortDescription: "Startup incorporation, ESOP design, angel tax, and tech financial leadership." },
        { name: "Hyderabad", slug: "hyderabad", state: "Telangana", isPopular: true, shortDescription: "IT & Pharma enterprise compliance, GST audit, and international transfer pricing." },
        { name: "Varanasi", slug: "varanasi", state: "Uttar Pradesh", isPopular: true, shortDescription: "Purvanchal business compliance, MSME taxation, and trader GST filing." },
        { name: "Ghazipur", slug: "ghazipur", state: "Uttar Pradesh", isPopular: true, shortDescription: "Fyntrust branch office & local business taxation desk for Eastern UP enterprises." },
        { name: "Noida", slug: "noida", state: "Uttar Pradesh", isPopular: true, shortDescription: "Export-import taxation, SEZ compliance, and corporate bookkeeping." },
      ];

      for (const dc of defaultCities) {
        await prisma.city.create({
          data: {
            name: dc.name,
            slug: dc.slug,
            state: dc.state,
            isPopular: dc.isPopular,
            shortDescription: dc.shortDescription,
            status: "ACTIVE",
          },
        });
      }

      cities = await prisma.city.findMany({
        where: { isActive: true },
        orderBy: [{ isPopular: "desc" }, { name: "asc" }],
        include: {
          _count: { select: { cityServicePages: true } },
        },
      });
    }

    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    console.error("Failed to list cities:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch locations" }, { status: 500 });
  }
}
