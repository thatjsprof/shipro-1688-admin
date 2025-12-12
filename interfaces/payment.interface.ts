import { IOrder } from "./order.interface";
import { IUser } from "./user.interface";

export interface IPayment {
  id: string;
  orderId: string;
  reference: string;
  amount: number;
  baseAmount: number;
  code: PaymentCodes;
  currency: string;
  status: PaymentStatus;
  datePaid: Date;
  link: string;
  providerFees: number;
  description: string;
  user: IUser;
  paymentBreakdown: Record<string, string>[];
}

export enum PaymentModules {
  SOURCING_ORDER = "SOURCING_ORDER",
  ORDER = "ORDER",
  WALLET = "WALLET",
}

export enum PaymentProviders {
  PAYSTACK = "paystack",
  WALLET = "wallet",
}

export enum PaymentCodes {
  SOURCING_FEE = "SOURCING_FEE",
  ITEM_FEE = "ITEM_FEE",
  GOODS_FEE = "GOODS_FEE",
  SHIPPING_FEE = "SHIPPING_FEE",
  DELIVERY_FEE = "DELIVERY_FEE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface IPaymentSession {
  id: string;
  order: IOrder;
  payments: IPayment[];
}
