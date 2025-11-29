import { Badge } from "@/components/ui/badge";
import { WalletTransactionStatus } from "@/interfaces/wallet.interface";
import { CheckCircle, CircleSlash, Clock, XCircle } from "lucide-react";

type PillSpec = {
  bg: string;
  text: string;
  icon: React.ComponentType<any>;
  label: string;
};

export const walletStatusInfo: Partial<
  Record<
    WalletTransactionStatus,
    {
      icon: string;
      bgColor: string;
      color: string;
      text: string;
    }
  >
> = {
  [WalletTransactionStatus.PENDING]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "",
    text: "Pending",
  },
  [WalletTransactionStatus.SUCCESSFUL]: {
    icon: "Package",
    bgColor: "#10B981",
    color: "",
    text: "Successful",
  },
  [WalletTransactionStatus.FAILED]: {
    icon: "CircleX",
    bgColor: "#EF4444",
    color: "",
    text: "Failed",
  },
};

export const paymentStatusPills: Record<WalletTransactionStatus, PillSpec> = {
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
};

export const PaymentStatusPill: React.FC<{
  status: WalletTransactionStatus;
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
