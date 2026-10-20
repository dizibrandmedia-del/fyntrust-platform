import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fyntrust.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin/*",
          "/customer/",
          "/customer/*",
          "/expert/",
          "/expert/*",
          "/api/admin/",
          "/api/customer/",
          "/api/expert/",
          "/api/auth/",
          "/login",
          "/register",
          "/order/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
