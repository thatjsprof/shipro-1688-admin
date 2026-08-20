import { Icons } from "@/components/shared/icons";
import { PaymentStatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AirLocation,
  IOrderItem,
  PackageWeightUnit,
} from "@/interfaces/order.interface";
import { PaymentCodes, PaymentProviders, PaymentStatus } from "@/interfaces/payment.interface";
import { notify } from "@/lib/toast";
import { formatNum } from "@/lib/utils";
import { paymentInputSchema } from "@/schemas/payment";
import { useCreatePaymentMutation } from "@/services/payment.service";
import { useAppSelector } from "@/store/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { buildCreatePaymentPayload } from "@/components/pages/payment/build-create-payment-payload";
import { CreatePaymentFormFields } from "@/components/pages/payment/create-payment-form-fields";
import {
  calculatePaymentBreakdownValues,
  emptyPaymentBreakdown,
  PaymentBreakdownSection,
} from "@/components/pages/payment/payment-breakdown-section";
import { defaultPaymentBreakdown } from "@/components/pages/payment/payment-form.constants";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItem: IOrderItem | null;
}

export const PaymentDialog = ({
  open,
  onOpenChange,
  orderItem,
}: PaymentDialogProps) => {
  const settings = useAppSelector((state) => state.app.setting);
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [packageWeight, setPackageWeight] = useState<number | undefined>(
    orderItem?.packageWeight
  );

  const packageWeightUnit =
    orderItem?.packageWeightUnit ?? PackageWeightUnit.KG;
  const freightUnitPrice =
    orderItem?.order?.airLocation === AirLocation.HK
      ? settings?.hkPrice ?? 0
      : settings?.gzPrice ?? 0;

  const form = useForm<z.infer<typeof paymentInputSchema>>({
    resolver: zodResolver(paymentInputSchema),
    mode: "onTouched",
    defaultValues: {
      amount: "",
      status: PaymentStatus.PENDING,
      description: "",
      code: "",
      provider: PaymentProviders.PAYSTACK,
      sendEmail: false,
      redirectLink: "",
      datePaid: undefined,
      paymentBreakdown: defaultPaymentBreakdown.map((item) => ({
        ...item,
        unit: "",
        calculatedValue: "",
      })),
    },
  });

  const { control, watch, reset } = form;
  const { fields, remove, replace } = useFieldArray({
    control,
    name: "paymentBreakdown",
  });
  const code = watch("code");

  useEffect(() => {
    if (!open) {
      reset({
        amount: "",
        status: PaymentStatus.PENDING,
        description: "",
        code: "",
        provider: PaymentProviders.PAYSTACK,
        sendEmail: false,
        redirectLink: "",
        datePaid: undefined,
        paymentBreakdown: emptyPaymentBreakdown,
      });
      setPackageWeight(undefined);
      return;
    }

    setPackageWeight(orderItem?.packageWeight);
    replace(
      calculatePaymentBreakdownValues(
        freightUnitPrice,
        orderItem?.packageWeight
      )
    );
  }, [open, orderItem, freightUnitPrice, replace, reset]);

  const handleSubmit = async (values: z.infer<typeof paymentInputSchema>) => {
    if (!orderItem) return;

    try {
      const payload = buildCreatePaymentPayload(values, {
        orderItemId: orderItem.id,
      });

      const res = await createPayment(payload).unwrap();

      if (res.status === 200) {
        notify(res.message || "Payment created successfully", "success");
        onOpenChange(false);
      } else {
        notify(res.message || "Failed to create payment", "error");
      }
    } catch (error: any) {
      notify(error?.data?.message || "Failed to create payment", "error");
    }
  };

  const existingPayments = orderItem?.payments ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create Payment</DialogTitle>
          <DialogDescription>
            Add a new payment record for this order item.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[calc(90vh-8rem)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="py-4">
              <CreatePaymentFormFields form={form} />
              {code === PaymentCodes.SHIPPING_FEE && (
                <PaymentBreakdownSection
                  form={form}
                  fields={fields}
                  remove={remove}
                  replace={replace}
                  packageWeight={packageWeight}
                  setPackageWeight={setPackageWeight}
                  packageWeightUnit={packageWeightUnit}
                  freightUnitPrice={freightUnitPrice}
                />
              )}
              {existingPayments.length > 0 && (
                <div className="mt-6">
                  <p className="mb-4 font-semibold">Existing Payments</p>
                  <div className="flex flex-col gap-4">
                    {existingPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-lg border p-4 space-y-1"
                      >
                        <p className="text-sm text-zinc-500">
                          {payment.reference}
                        </p>
                        <p className="text-sm">{payment.description}</p>
                        <p className="text-sm font-medium">
                          ₦{formatNum(payment.baseAmount || payment.amount)}
                        </p>
                        {payment.datePaid && (
                          <p className="text-xs text-zinc-500">
                            Paid:{" "}
                            {format(
                              new Date(payment.datePaid),
                              "MM/dd/yyyy h:mm a"
                            )}
                          </p>
                        )}
                        <PaymentStatusPill status={payment.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="shadow-none h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="shadow-none h-11"
                >
                  {isLoading && (
                    <Icons.spinner className="h-3 w-3 animate-spin" />
                  )}
                  Create Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
