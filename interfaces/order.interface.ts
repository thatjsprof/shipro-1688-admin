import { IAddress } from "./address.interface";
import { IPayment } from "./payment.interface";
import { IProduct } from "./product.interface";
import { IUser } from "./user.interface";

export enum OrderType {
  PURCHASE = "PURCHASE",
  SHIPMENT = "SHIPMENT",
}

export enum ShippingType {
  AIR = "AIR",
  SEA = "SEA",
}
export enum AirLocation {
  HK = "HK",
  GZ = "GZ",
}

export enum OrderOrigin {
  NORMAL = "NORMAL",
  SOURCING = "SOURCING",
}

export enum TabsName {
  Draft = "Draft",
  Placed = "placed",
  In_Warehouse = "in_warehouse",
  Shipments = "shipments",
}

export interface IOrder {
  id: string;
  items: IOrderItem[];
  shipmentItems: IOrderItem[];
  trackingNumber: string;
  packageWeight: number;
  orderNumber: string;
  estimatedDelivery: Date;
  deliveredAt: Date;
  orderAmount: number;
  shippingFeeWithinChina: number;
  serviceCharge: number;
  subTotal: number;
  paidShippingFee: boolean;
  shippingFee: number;
  createdAt: Date;
  emailsSent: Record<string, string[]>;
  type: OrderType;
  deliveryAddress: IAddress;
  origin: OrderOrigin;
  status: OrderStatus;
  payments: IPayment[];
  user: IUser;
  trackingUpdates: IOrderTracking[];
}

export interface IOrderItem {
  id: string;
  product: IProduct;
  variants: Record<string, any>;
  quantity: number;
  trackingNumber: string;
  tags: string[];
  packageWeight: number;
  totalWeight: number;
  orderAmount: number;
  order: IOrder;
  name: string;
  images: {
    filename: string;
    key: string;
    url: string;
  }[];
  emailsSent: Record<OrderStatus, string[]>;
  category: string;
  timeArrivedInWarehouse: Date;
  note: string;
  items: {
    type: "picture" | "link";
    quantity: number;
    pictures?: {
      filename: string;
      key: string;
      url: string;
    }[];
    link?: string;
    note?: string;
  }[];
  shipmentOrder: IOrder;
  payments: IPayment[];
  status: OrderStatus;
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
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  SOURCING = "SOURCING",
  IN_TRANSIT_TO_WAREHOUSE = "IN_TRANSIT_TO_WAREHOUSE",
  AT_WAREHOUSE = "AT_WAREHOUSE",
  PENDING_TRANSIT = "PENDING_TRANSIT",
  IN_TRANSIT = "IN_TRANSIT",
  IN_NIGERIA = "IN_NIGERIA",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum OrderEmails {
  WAREHOUSE_ARRIVAL = "WAREHOUSE_ARRIVAL",
}
