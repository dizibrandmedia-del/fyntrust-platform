import { prisma } from "../db/prisma";

export interface RedirectResult {
  destination: string;
  statusCode: number;
}

export async function resolveRedirect(sourcePath: string): Promise<RedirectResult | null> {
  if (!sourcePath) return null;

  const normalizedSource = sourcePath.toLowerCase().trim();

  try {
    const redirect = await prisma.redirect.findUnique({
      where: { sourceUrl: normalizedSource },
    });

    if (!redirect || !redirect.isActive) return null;

    // Safety checks
    const dest = redirect.destinationUrl.trim();

    // 1. Prevent circular self-redirects
    if (dest.toLowerCase() === normalizedSource) {
      return null;
    }

    // 2. Prevent unsafe protocols / open redirects
    if (
      dest.startsWith("javascript:") ||
      dest.startsWith("data:") ||
      dest.startsWith("vbscript:")
    ) {
      return null;
    }

    // Increment hits count in background
    prisma.redirect
      .update({
        where: { id: redirect.id },
        data: { hitsCount: { increment: 1 } },
      })
      .catch(() => {});

    return {
      destination: dest,
      statusCode: redirect.statusCode || 301,
    };
  } catch (error) {
    return null;
  }
}

export async function createSafeRedirect(
  sourceUrl: string,
  destinationUrl: string,
  statusCode: number = 301
) {
  const normSource = sourceUrl.toLowerCase().trim();
  const normDest = destinationUrl.trim();

  if (normSource === normDest.toLowerCase()) {
    throw new Error("Source and destination URLs cannot be identical (circular redirect).");
  }

  if (
    normDest.startsWith("javascript:") ||
    normDest.startsWith("data:") ||
    normDest.startsWith("vbscript:")
  ) {
    throw new Error("Unsafe destination protocol.");
  }

  return await prisma.redirect.upsert({
    where: { sourceUrl: normSource },
    update: {
      destinationUrl: normDest,
      statusCode,
      isActive: true,
    },
    create: {
      sourceUrl: normSource,
      destinationUrl: normDest,
      statusCode,
      isActive: true,
    },
  });
}
