import { OrderEmails, OrderStatus } from "@/interfaces/order.interface";
import { PaymentCodes, PaymentStatus } from "@/interfaces/payment.interface";

export const orderEmailsInfo: Partial<
  Record<
    OrderEmails,
    {
      icon: string;
      bgColor: string;
      color: string;
      text: string;
    }
  >
> = {
  [OrderEmails.WAREHOUSE_ARRIVAL]: {
    icon: "PencilLine",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Warehouse Arrival",
  },
};

export const statusTags: Record<PaymentCodes, string> = {
  [PaymentCodes.GOODS_FEE]: "Goods Fee",
  [PaymentCodes.ITEM_FEE]: "Fees Fee",
  [PaymentCodes.SHIPPING_FEE]: "Shipping Fee",
  [PaymentCodes.SOURCING_FEE]: "Sourcing Fee",
};

export const paymentStatus: Record<PaymentStatus, string> = {
  [PaymentStatus.SUCCESSFUL]: "Successful",
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.CANCELLED]: "Cancelled",
  [PaymentStatus.FAILED]: "Failed",
};

export const orderStatusTitle: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.DRAFT]: "Draft",
  [OrderStatus.PLACED]: "Placed",
  [OrderStatus.SOURCING]: "Sourcing",
  [OrderStatus.PURCHASED]: "Purchased",
  [OrderStatus.PENDING_TRANSIT_TO_WAREHOUSE]: "Warehouse Inbound Pending",
  [OrderStatus.IN_TRANSIT_TO_WAREHOUSE]: "Warehouse Inbound",
  [OrderStatus.AT_WAREHOUSE]: "In Warehouse",
  [OrderStatus.PENDING_TRANSIT]: "Pending Transit",
  [OrderStatus.IN_TRANSIT]: "In Transit",
  [OrderStatus.IN_NIGERIA]: "In Nigeria",
  [OrderStatus.OUT_FOR_DELIVERY]: "Out For Delivery",
  [OrderStatus.PROCESSING]: "Processing",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};
export const shipmentStatusDesc: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING_TRANSIT]: "Your order is pending transit to Nigeria",
  [OrderStatus.IN_TRANSIT]: "Your order is in transit to Nigeria",
  [OrderStatus.IN_NIGERIA]: "Your order is in Nigeria",
  [OrderStatus.OUT_FOR_DELIVERY]: "Your order is out for delivery",
  [OrderStatus.PROCESSING]: "Your order is being processed",
  [OrderStatus.DELIVERED]: "Your order have been delivered",
  [OrderStatus.CANCELLED]: "Your order has been Cancelled",
};

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
    color: "#fff",
    text: "Draft",
  },
  [OrderStatus.IN_TRANSIT_TO_WAREHOUSE]: {
    icon: "PackagePlus",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "In Transit to Warehouse",
  },
  [OrderStatus.PLACED]: {
    icon: "PackagePlus",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Placed",
  },
  [OrderStatus.PROCESSING]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Processing",
  },
  [OrderStatus.SOURCING]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Sourcing",
  },
  [OrderStatus.PENDING_TRANSIT]: {
    icon: "PackagePlus",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "Pending Transit",
  },
  [OrderStatus.IN_TRANSIT]: {
    icon: "ClockArrowUp",
    bgColor: "#F59E0B",
    color: "#fff",
    text: "In Transit",
  },
  [OrderStatus.IN_NIGERIA]: {
    icon: "Wallet",
    bgColor: "#6366F1",
    color: "#fff",
    text: "In Nigeria",
  },
  [OrderStatus.SHIPPED]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "Shipped",
  },
  [OrderStatus.PENDING_TRANSIT_TO_WAREHOUSE]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "Pending Transit to Warehouse",
  },
  [OrderStatus.PURCHASED]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "Purchased",
  },
  [OrderStatus.AT_WAREHOUSE]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "In Warehouse",
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    icon: "CircleDot",
    bgColor: "#10B981",
    color: "#fff",
    text: "Out for Delivery",
  },
  [OrderStatus.DELIVERED]: {
    icon: "Package",
    bgColor: "#10B981",
    color: "#fff",
    text: "Delivered",
  },
  [OrderStatus.CANCELLED]: {
    icon: "CircleX",
    bgColor: "#EF4444",
    color: "#fff",
    text: "Cancelled",
  },
};

// type Step = {
//   id: ISteps;
//   label: string;
// };

// export const steps: Step[] = [
//   { id: ISteps.SENDER, label: "Item details" },
//   { id: ISteps.RECEIVER, label: "Receiver Details" },
//   { id: ISteps.ITEMS, label: "Item Description" },
//   { id: ISteps.SUMMARY, label: "Order Summary" },
// ];
