import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, CircleSlash } from "lucide-react";

export type PaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "CANCELLED";

type PillSpec = {
  bg: string;
  text: string;
  icon: React.ComponentType<any>;
  label: string;
};

export const paymentStatusPills: Record<PaymentStatus, PillSpec> = {
  PENDING: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: Clock,
    label: "Pending",
  },
  SUCCESSFUL: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle,
    label: "Successful",
  },
  FAILED: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
    label: "Failed",
  },
  CANCELLED: {
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    icon: CircleSlash,
    label: "Cancelled",
  },
};

export const PaymentStatusPill: React.FC<{
  status: PaymentStatus;
  className?: string;
  text?: string;
}> = ({ status, className = "", text }) => {
  const spec = paymentStatusPills[status];
  const Icon = spec.icon;
  return (
    <Badge
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full ${spec.bg} ${spec.text} ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span>{text ?? spec.label}</span>
    </Badge>
  );
};
