import { OrderEmails, OrderStatus } from "@/interfaces/order.interface";
import { z } from "zod";

export const orderSchema = z.object({
  pictures: z
    .array(
      z.object({
        filename: z.string(),
        key: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
  arrivedWarehouse: z.date().optional(),
  trackingNumber: z.string().optional(),
  packageWeight: z.string().optional(),
  sendEmail: z.boolean().optional(),
  tags: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  status: z.union([z.nativeEnum(OrderStatus), z.literal("")]).optional(),
});

export const shipmentSchema = z.object({
  trackingNumber: z.string().optional(),
  packageWeight: z.string().optional(),
  sendEmail: z.boolean().optional(),
  deliveredAt: z.union([z.date(), z.string()]).optional(),
  addTracking: z.boolean().optional(),
  status: z.union([z.nativeEnum(OrderStatus), z.literal("")]).optional(),
});

export const orderEmailsSchema = z.object({
  emailType: z.union([z.nativeEnum(OrderEmails), z.literal("")]).optional(),
});
