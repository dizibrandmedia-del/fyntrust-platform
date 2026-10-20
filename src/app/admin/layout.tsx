import React from "react";
import { AdminLayoutComponent } from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Operations Control Centre | Fyntrust Super Admin",
  description: "Administrative control centre for managing orders, manual CA expert assignment, CRM leads, and corporate services.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
