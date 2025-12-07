import {
  AirLocation,
  OrderOrigin,
  OrderStatus,
  OrderType,
  ShippingType,
} from "@/interfaces/order.interface";
import { z } from "zod";
import { paymentInputSchema } from "./payment";

const OrderTypeEnum = z.enum(OrderType);
const OrderOriginEnum = z.enum(OrderOrigin);
const ShippingTypeEnum = z.enum(ShippingType);
const AirLocationEnum = z.enum(AirLocation);
const OrderStatusEnum = z.enum(OrderStatus);

export const orderSchema = z.object({
  type: OrderTypeEnum,
  origin: OrderOriginEnum,
  status: OrderStatusEnum,
  shippingType: ShippingTypeEnum.optional(),
  airLocation: AirLocationEnum.optional(),
  orderNumber: z.string().optional(),
  userId: z.string().optional(),
  trackingNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  subTotal: z.string().optional(),
  orderAmount: z.string().optional(),
  baseAmount: z.string().optional(),
  serviceCharge: z.string().optional(),
  totalWeight: z.string().optional(),
  packageWeight: z.string().optional(),
  shippingFeeWithinChina: z.string().optional(),
  note: z.string().optional(),
  estimatedDelivery: z.date().optional(),
  deliveredAt: z.date().optional(),
  dateOrdered: z.date().optional(),
});

export const orderItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.string().optional(),
  orderAmount: z.string().optional(),
  packageWeight: z.string().optional(),
  totalWeight: z.string().optional(),
  trackingNumber: z.string().optional(),
  category: z.string().optional(),
  note: z.string().optional(),
  shipmentNote: z.string().optional(),
  status: OrderStatusEnum,
  dateOrdered: z.date().optional(),
  timeArrivedInWarehouse: z.date().optional(),
  tags: z.array(z.string()).optional(),
  variants: z.record(z.any(), z.any()).optional(),
  images: z
    .array(
      z.object({
        filename: z.string(),
        key: z.string(),
        url: z.string().url(),
        type: z.string(),
      })
    )
    .optional(),
  items: z
    .array(
      z.object({
        type: z.enum(["picture", "link"]),
        quantity: z.number().positive(),
        pictures: z
          .array(
            z.object({
              filename: z.string(),
              key: z.string(),
              url: z.string().url(),
            })
          )
          .optional(),
        link: z.string().url().optional(),
        note: z.string().optional(),
      })
    )
    .optional(),
});

export const createOrderSchema = z.object({
  order: orderSchema,
  items: z.array(orderItemSchema).min(1, "At least one order item is required"),
  payments: z
    .array(paymentInputSchema)
    .min(1, "At least one payment is required"),
});
