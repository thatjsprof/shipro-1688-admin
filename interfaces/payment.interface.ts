export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum PaymentCodes {
  SOURCING_FEE = "SOURCING_FEE",
  GOODS_FEE = "GOODS_FEE",
  SHIPPING_FEE = "SHIPPING_FEE",
}

export enum PaymentModules {
  SOURCING_ORDER = "SOURCING_ORDER",
  ORDER = "ORDER",
  WALLET = "WALLET",
}

export enum PaymentProviders {
  PAYSTACK = "paystack",
}

export interface IPayment {
  id: string;
  orderId?: string;
  orderItemId?: string;
  sourcingOrderId?: string;
  trackingId?: string;
  reference: string;
  amount: number;
  currency?: string;
  code?: PaymentCodes;
  module: PaymentModules;
  status: PaymentStatus;
  provider?: PaymentProviders;
  providerReference?: string;
  description?: string;
  datePaid?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
