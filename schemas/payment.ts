import { z } from "zod";
import {
  PaymentStatus,
  PaymentCodes,
  PaymentProviders,
} from "@/interfaces/payment.interface";

export const paymentInputSchema = z
  .object({
    amount: z.string().min(1, "Amount is required"),
    status: z.union([z.nativeEnum(PaymentStatus), z.literal("")]),
    description: z.string().min(1, "Description is required"),
    redirectLink: z.string().min(1, "Redirect Link is required"),
    code: z.union([z.nativeEnum(PaymentCodes), z.literal("")]),
    sendEmail: z.boolean().optional(),
    paymentBreakdown: z
      .array(
        z.object({
          value: z.string(),
          calculatedValue: z.string(),
          label: z.string(),
          unit: z.string(),
        })
      )
      .optional(),
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

export const paymentAltInputSchema = z.object({
  amount: z.union([z.number(), z.string()]),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  description: z.string().optional(),
  code: z.nativeEnum(PaymentCodes).optional(),
});

export const paymentAltSchema = paymentAltInputSchema
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

export type PaymentAltFormData = z.infer<typeof paymentAltSchema>;

export type PaymentAltFormInput = z.input<typeof paymentAltInputSchema>;

export const editPaymentInputSchema = z
  .object({
    description: z.string().min(1, "Description is required"),
    amount: z.string().min(1, "Amount is required"),
    status: z.nativeEnum(PaymentStatus),
    provider: z.nativeEnum(PaymentProviders),
    datePaid: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      const num = parseFloat(data.amount);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be greater than 0", path: ["amount"] }
  );

export const editPaymentSchema = editPaymentInputSchema
  .refine(
    (data) => {
      const num = parseFloat(data.amount);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be greater than 0", path: ["amount"] }
  )
  .transform((data) => ({
    ...data,
    amount: parseFloat(data.amount),
    datePaid: data.datePaid ?? undefined,
  }));

export type EditPaymentFormData = z.infer<typeof editPaymentSchema>;
export type EditPaymentFormInput = z.input<typeof editPaymentInputSchema>;
