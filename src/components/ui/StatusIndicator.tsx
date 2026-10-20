import React from "react";
import { Badge } from "./Badge";

export interface StatusIndicatorProps {
  status: string;
  type?: "order" | "document" | "payment" | "lead" | "compliance";
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, type = "order" }) => {
  const getStatusConfig = () => {
    switch (status) {
      // Orders
      case "ORDER_PLACED":
        return { label: "Order Placed", variant: "primary" as const };
      case "PAYMENT_RECEIVED":
        return { label: "Payment Received", variant: "accent" as const };
      case "DOCUMENTS_PENDING":
        return { label: "Documents Pending", variant: "warning" as const };
      case "DOCUMENTS_VERIFIED":
        return { label: "Documents Verified", variant: "accent" as const };
      case "EXPERT_ASSIGNED":
        return { label: "Expert Assigned", variant: "gold" as const };
      case "WORK_IN_PROGRESS":
        return { label: "Work In Progress", variant: "primary" as const };
      case "SUBMITTED_FILED":
        return { label: "Submitted / Filed", variant: "accent" as const };
      case "GOVERNMENT_PROCESSING":
        return { label: "Govt Processing", variant: "warning" as const };
      case "COMPLETED":
        return { label: "Completed", variant: "accent" as const };
      case "CANCELLED":
        return { label: "Cancelled", variant: "danger" as const };
      case "ON_HOLD":
        return { label: "On Hold", variant: "neutral" as const };

      // Documents
      case "PENDING_VERIFICATION":
        return { label: "Under Verification", variant: "warning" as const };
      case "VERIFIED":
        return { label: "Verified", variant: "accent" as const };
      case "REJECTED":
        return { label: "Rejected", variant: "danger" as const };

      // Payments
      case "PAID":
        return { label: "Paid", variant: "accent" as const };
      case "PENDING":
        return { label: "Pending", variant: "warning" as const };
      case "FAILED":
        return { label: "Failed", variant: "danger" as const };
      case "REFUNDED":
        return { label: "Refunded", variant: "neutral" as const };

      // Leads
      case "NEW_LEAD":
        return { label: "New Lead", variant: "primary" as const };
      case "QUALIFIED":
        return { label: "Qualified", variant: "accent" as const };
      case "CONVERTED":
        return { label: "Converted", variant: "gold" as const };
      case "LOST":
        return { label: "Lost", variant: "danger" as const };

      default:
        return { label: status.replace(/_/g, " "), variant: "neutral" as const };
    }
  };

  const config = getStatusConfig();
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
