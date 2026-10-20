import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl || !envUrl.startsWith("file:")) {
    return envUrl;
  }

  const cwd = process.cwd();
  const prismaDb = path.join(cwd, "prisma", "dev.db");
  const rootDb = path.join(cwd, "dev.db");

  if (fs.existsSync(prismaDb)) {
    return `file:${prismaDb}`;
  } else if (fs.existsSync(rootDb)) {
    return `file:${rootDb}`;
  }

  return `file:${prismaDb}`;
}

const resolvedDbUrl = getDatabaseUrl();

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: resolvedDbUrl
      ? {
          db: {
            url: resolvedDbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
