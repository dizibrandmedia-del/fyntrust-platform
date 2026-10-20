import React from "react";
import { ExpertLayoutComponent } from "@/components/expert/ExpertLayout";

export const metadata = {
  title: "CA & Partner Operations Workspace | Fyntrust",
  description: "Fyntrust professional partner workspace for filing management, document verification, application drafting, and client communication.",
};

export default function ExpertRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ExpertLayoutComponent>{children}</ExpertLayoutComponent>;
}
