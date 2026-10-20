import React from "react";
import { CustomerPortalLayout } from "@/components/customer/CustomerLayout";

export const metadata = {
  title: "Client Portal Workspace | Fyntrust",
  description: "Private corporate client workspace for tracking CA filings, encrypted document vault, payments, and compliance.",
};

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerPortalLayout>{children}</CustomerPortalLayout>;
}
