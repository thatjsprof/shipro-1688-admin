import { ISteps, OrderStatus } from "@/interfaces/order.interface";

export const orderStatusInfo: Partial<
  Record<
    OrderStatus,
    {
      icon: string;
      bgColor: string;
      color: string;
      text: string;
    }
  >
> = {
  [OrderStatus.DRAFT]: {
    icon: "PencilLine",
    bgColor: "#F59E0B",
    color: "",
    text: "Draft",
  },
  [OrderStatus.PLACED]: {
    icon: "PackagePlus",
    bgColor: "#F59E0B",
    color: "",
    text: "Placed",
  },
  [OrderStatus.PROCESSING]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "",
    text: "Processing",
  },
  [OrderStatus.PAYMENT_MADE]: {
    icon: "Wallet",
    bgColor: "#6366F1",
    color: "",
    text: "Payment Made",
  },
  [OrderStatus.SHIPPED]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "",
    text: "Shipped",
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    icon: "CircleDot",
    bgColor: "#10B981",
    color: "",
    text: "out for delivery",
  },
  [OrderStatus.DELIVERED]: {
    icon: "Package",
    bgColor: "#10B981",
    color: "",
    text: "Delivered",
  },
  [OrderStatus.CANCELLED]: {
    icon: "CircleX",
    bgColor: "#EF4444",
    color: "",
    text: "Cancelled",
  },
};

type Step = {
  id: ISteps;
  label: string;
};

export const steps: Step[] = [
  { id: ISteps.SENDER, label: "Item details" },
  { id: ISteps.RECEIVER, label: "Receiver Details" },
  { id: ISteps.ITEMS, label: "Item Description" },
  { id: ISteps.SUMMARY, label: "Order Summary" },
];
