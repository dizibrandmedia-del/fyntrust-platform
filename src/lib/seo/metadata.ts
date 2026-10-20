import { Metadata } from "next";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  keywords?: string[];
}

const DEFAULT_SEO = {
  title: "Fyntrust | PAN India Finance, Accounting, Tax, Compliance & Virtual CFO",
  description:
    "Fyntrust is a premier digital financial and compliance services platform. Expert CA, CS, and Legal advisory for GST, Income Tax, ROC compliance, and Virtual CFO leadership across India.",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://fyntrust.in",
  ogImage: "/images/fyntrust-og.png",
  twitterHandle: "@fyntrust",
};

export function constructMetadata({
  title,
  description = DEFAULT_SEO.description,
  canonical,
  ogImage = DEFAULT_SEO.ogImage,
  ogType = "website",
  robots = { index: true, follow: true },
  keywords = [
    "Chartered Accountant",
    "CA Services India",
    "GST Registration",
    "Income Tax Filing",
    "Company Registration",
    "Virtual CFO",
    "ROC Compliance",
    "Fyntrust",
  ],
}: SEOProps = {}): Metadata {
  const metaTitle = title
    ? `${title} | Fyntrust`
    : DEFAULT_SEO.title;

  const canonicalUrl = canonical
    ? `${DEFAULT_SEO.siteUrl}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
    : undefined;

  return {
    title: metaTitle,
    description,
    keywords: keywords.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: robots.index ?? true,
      follow: robots.follow ?? true,
      googleBot: {
        index: robots.index ?? true,
        follow: robots.follow ?? true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: metaTitle,
      description,
      type: ogType,
      url: canonicalUrl,
      siteName: "Fyntrust",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${DEFAULT_SEO.siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      creator: DEFAULT_SEO.twitterHandle,
      images: [ogImage.startsWith("http") ? ogImage : `${DEFAULT_SEO.siteUrl}${ogImage}`],
    },
  };
}
