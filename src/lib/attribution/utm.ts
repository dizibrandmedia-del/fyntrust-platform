export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
}

const STORAGE_KEY = "fyntrust_utm_attribution";

export function extractUtmFromUrl(url: string, referrer: string = ""): UtmParams {
  try {
    const parsed = new URL(url, "https://fyntrust.in");
    const params = parsed.searchParams;

    const utmSource = params.get("utm_source") || (referrer ? getSourceFromReferrer(referrer) : "DIRECT");
    const utmMedium = params.get("utm_medium") || undefined;
    const utmCampaign = params.get("utm_campaign") || undefined;
    const utmTerm = params.get("utm_term") || undefined;
    const utmContent = params.get("utm_content") || undefined;

    return {
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      landingPage: parsed.pathname,
      referrer: referrer || undefined,
    };
  } catch (e) {
    return { utmSource: "DIRECT" };
  }
}

export function storeUtmAttribution(params: UtmParams): void {
  if (typeof window === "undefined") return;
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    // Only store first touch attribution if not already present
    if (!existing) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    }
  } catch (e) {
    // Ignore storage issues in private mode
  }
}

export function getStoredUtmAttribution(): UtmParams {
  if (typeof window === "undefined") return { utmSource: "WEBSITE" };
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Fallback
  }
  return { utmSource: "WEBSITE" };
}

function getSourceFromReferrer(referrer: string): string {
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes("google")) return "GOOGLE_ORGANIC";
    if (host.includes("bing")) return "BING_ORGANIC";
    if (host.includes("linkedin")) return "LINKEDIN";
    if (host.includes("facebook") || host.includes("fb.")) return "FACEBOOK";
    if (host.includes("instagram")) return "INSTAGRAM";
    if (host.includes("twitter") || host.includes("t.co") || host.includes("x.com")) return "TWITTER";
    if (host.includes("whatsapp")) return "WHATSAPP";
    return `REFERRAL_${host.replace(/\./g, "_").toUpperCase()}`;
  } catch {
    return "REFERRAL";
  }
}
