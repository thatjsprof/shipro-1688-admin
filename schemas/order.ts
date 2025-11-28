import { OrderStatus } from "@/interfaces/order.interface";
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
