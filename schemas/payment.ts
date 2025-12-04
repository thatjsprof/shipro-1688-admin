import { z } from "zod";
import { PaymentStatus, PaymentCodes } from "@/interfaces/payment.interface";

export const paymentInputSchema = z
  .object({
    amount: z.string().min(1, "Amount is required"),
    status: z.union([z.nativeEnum(PaymentStatus), z.literal("")]),
    description: z.string().min(1, "Description is required"),
    redirectLink: z.string().min(1, "Link is required"),
    code: z.union([z.nativeEnum(PaymentCodes), z.literal("")]),
    sendEmail: z.boolean().optional(),
  })
  .refine((data) => data.status !== "", {
    message: "Status is required",
    path: ["status"],
  })
  .refine((data) => data.code !== "", {
    message: "Code is required",
    path: ["code"],
  });

export const paymentSchema = paymentInputSchema
  .refine(
    (data) => {
      if (
        data.amount === "" ||
        data.amount === undefined ||
        data.amount === null
      )
        return false;
      const num =
        typeof data.amount === "string" ? parseFloat(data.amount) : data.amount;
      return !isNaN(num) && num > 0;
    },
    {
      message: "Amount must be greater than 0",
      path: ["amount"],
    }
  )
  .refine((data) => data.code !== undefined, {
    message: "Payment code is required",
    path: ["code"],
  })
  .transform((data) => ({
    amount:
      typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
    status: data.status,
    description: data.description,
    code: data.code!,
  }));

export type PaymentFormData = z.infer<typeof paymentSchema>;

export type PaymentFormInput = z.input<typeof paymentInputSchema>;
