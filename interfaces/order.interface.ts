export interface IOrder {
  id: string;
  items: IOrderItem[];
  trackingNumber: string;
  packageWeight: number;
  orderNumber: string;
  estimatedDelivery: Date;
  orderAmount: number;
  shippingFeeWithinChina: number;
  serviceCharge: number;
  subTotal: number;
  createdAt: Date;
  status: OrderStatus;
  trackingUpdates: IOrderTracking[];
}

export interface IOrderItem {
  product: any;
  variants: Record<string, any>;
  quantity: number;
  trackingNumber: string;
  totalWeight: number;
  orderAmount: number;
}

export interface IOrderTracking {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: OrderStatus;
  stage: TrackingStage;
}

export enum TrackingStage {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  NOT_STARTED = "NOT_STARTED",
}

export enum OrderStatus {
  DRAFT = "DRAFT",
  PLACED = "PLACED",
  PAYMENT_MADE = "PAYMENT_MADE",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum ISteps {
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
  ITEMS = "ITEMS",
  DELIVERY = "DELIVERY",
  SUMMARY = "SUMMARY",
}
