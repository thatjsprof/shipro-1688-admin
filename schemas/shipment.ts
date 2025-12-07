import { AirLocation, ShippingType } from "@/interfaces/order.interface";
import z from "zod";

export const shippingSchema = z
  .object({
    shippingType: z.nativeEnum(ShippingType).optional(),
    airLocation: z.nativeEnum(AirLocation).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.shippingType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a shipping type.",
        path: ["shippingType"],
      });
    }
    if (data.shippingType === ShippingType.AIR && !data.airLocation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a location for air shipping.",
        path: ["airLocation"],
      });
    }
  });

export type ShippingFormValues = z.infer<typeof shippingSchema>;
