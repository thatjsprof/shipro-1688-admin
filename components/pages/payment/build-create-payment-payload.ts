import {
  PaymentCodes,
  PaymentModules,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { paymentInputSchema } from "@/schemas/payment";
import z from "zod";

type PaymentInput = z.infer<typeof paymentInputSchema>;

export const buildCreatePaymentPayload = (
  values: PaymentInput,
  options: {
    orderId?: string;
    orderItemId?: string;
    module?: PaymentModules;
  }
) => ({
  description: values.description,
  amount: +values.amount,
  baseAmount: +values.amount,
  module: options.module ?? PaymentModules.ORDER,
  status: values.status as PaymentStatus,
  code: values.code as PaymentCodes,
  provider: values.provider as PaymentProviders,
  redirectLink: values.redirectLink,
  sendEmail: !!values.sendEmail,
  ...(values.datePaid && {
    datePaid: new Date(values.datePaid),
  }),
  ...(values.code === PaymentCodes.SHIPPING_FEE && {
    paymentBreakdown: values.paymentBreakdown,
  }),
  ...(options.orderId ? { orderId: options.orderId } : {}),
  ...(options.orderItemId ? { orderItemId: options.orderItemId } : {}),
});
