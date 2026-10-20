export const FYNTRUST_BUSINESS_INFO = {
  name: "Fyntrust Business Advisory Services",
  legalName: "Fyntrust Technologies Pvt. Ltd.",
  url: "https://fyntrust.in",
  logo: "https://fyntrust.in/images/fyntrust-logo.png",
  phone: "+91 9118066449",
  email: "team@fyntrust.in",
  offices: [
    {
      city: "Lucknow",
      address: "Hazratganj Financial District, Lucknow, Uttar Pradesh, 226001",
      state: "Uttar Pradesh",
      country: "IN",
    },
    {
      city: "Ghazipur",
      address: "Station Road, Commercial Complex, Ghazipur, Uttar Pradesh, 233001",
      state: "Uttar Pradesh",
      country: "IN",
    },
  ],
  socialLinks: [
    "https://www.linkedin.com/company/fyntrust",
    "https://twitter.com/fyntrust",
    "https://www.facebook.com/fyntrust",
  ],
};

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: FYNTRUST_BUSINESS_INFO.name,
    legalName: FYNTRUST_BUSINESS_INFO.legalName,
    url: FYNTRUST_BUSINESS_INFO.url,
    logo: FYNTRUST_BUSINESS_INFO.logo,
    telephone: FYNTRUST_BUSINESS_INFO.phone,
    email: FYNTRUST_BUSINESS_INFO.email,
    sameAs: FYNTRUST_BUSINESS_INFO.socialLinks,
    address: FYNTRUST_BUSINESS_INFO.offices.map((office) => ({
      "@type": "PostalAddress",
      streetAddress: office.address,
      addressLocality: office.city,
      addressRegion: office.state,
      addressCountry: office.country,
    })),
    priceRange: "₹₹",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:30",
        closes: "19:00",
      },
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Fyntrust",
    url: FYNTRUST_BUSINESS_INFO.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${FYNTRUST_BUSINESS_INFO.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${FYNTRUST_BUSINESS_INFO.url}${item.url}`,
    })),
  };
}

export function generateServiceSchema({
  name,
  description,
  url,
  startingPrice,
  currency = "INR",
}: {
  name: string;
  description: string;
  url: string;
  startingPrice?: number;
  currency?: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "FinancialService",
      name: FYNTRUST_BUSINESS_INFO.name,
      url: FYNTRUST_BUSINESS_INFO.url,
      telephone: FYNTRUST_BUSINESS_INFO.phone,
    },
    url: url.startsWith("http") ? url : `${FYNTRUST_BUSINESS_INFO.url}${url}`,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  if (startingPrice && startingPrice > 0) {
    schema.offers = {
      "@type": "Offer",
      price: startingPrice,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    };
  }

  return schema;
}

export function generateFaqSchema(faqs: { q: string; a: string }[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function generateArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = "Fyntrust Editorial Team",
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: url.startsWith("http") ? url : `${FYNTRUST_BUSINESS_INFO.url}${url}`,
    image: image || `${FYNTRUST_BUSINESS_INFO.url}/images/fyntrust-og.png`,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: FYNTRUST_BUSINESS_INFO.name,
      logo: {
        "@type": "ImageObject",
        url: FYNTRUST_BUSINESS_INFO.logo,
      },
    },
  };
}

export function generateReviewSchema({
  itemName,
  reviews,
}: {
  itemName: string;
  reviews: { author: string; rating: number; reviewBody: string; datePublished?: string }[];
}) {
  if (!reviews || reviews.length === 0) return null;

  const validRatings = reviews.filter((r) => r.rating >= 1 && r.rating <= 5);
  if (validRatings.length === 0) return null;

  const avgRating = Number(
    (validRatings.reduce((sum, r) => sum + r.rating, 0) / validRatings.length).toFixed(1)
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: itemName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: validRatings.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: validRatings.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
      },
      reviewBody: r.reviewBody,
      datePublished: r.datePublished || new Date().toISOString(),
    })),
  };
}
