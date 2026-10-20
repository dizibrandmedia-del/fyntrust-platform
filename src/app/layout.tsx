import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

export const metadata: Metadata = {
  title: "Fyntrust — PAN India Finance, Accounting, Tax, Compliance & Virtual CFO Platform",
  description:
    "Access certified CA, Tax, Accounting, Compliance, Payroll, Legal & Virtual CFO services through Fyntrust's PAN India expert network.",
  keywords: [
    "Chartered Accountant",
    "GST Registration",
    "Virtual CFO",
    "Company Registration",
    "Income Tax Return",
    "ROC Compliance",
    "Fyntrust",
    "Tax Consultant",
  ],
  metadataBase: new URL("https://fyntrust.in"),
  openGraph: {
    title: "Fyntrust — India's Premier Business Finance & CA Platform",
    description: "Complete financial, tax, and compliance support for Indian businesses and startups.",
    url: "https://fyntrust.in",
    siteName: "Fyntrust",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/fyntrust-logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#F8FAFB] text-fyn-slate antialiased selection:bg-[#78BB69] selection:text-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
