import { OrderEmails, OrderStatus } from "@/interfaces/order.interface";

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
    color: "",
    text: "In Nigeria",
  },
  [OrderStatus.SHIPPED]: {
    icon: "Truck",
    bgColor: "#06B6D4",
    color: "#fff",
    text: "Shipped",
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
