import { Icons } from "@/components/shared/icons";
import { PaymentStatusPill } from "@/components/shared/status-pill";
import { buildCreatePaymentPayload } from "@/components/pages/payment/build-create-payment-payload";
import { CreatePaymentFormFields } from "@/components/pages/payment/create-payment-form-fields";
import {
  calculatePaymentBreakdownValues,
  emptyPaymentBreakdown,
  PaymentBreakdownSection,
} from "@/components/pages/payment/payment-breakdown-section";
import { defaultPaymentBreakdown, ordersRedirectLink, shipmentsRedirectLink } from "@/components/pages/payment/payment-form.constants";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  AirLocation,
  IOrder,
  OrderType,
  PackageWeightUnit,
} from "@/interfaces/order.interface";
import {
  IPayment,
  PaymentCodes,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { notify } from "@/lib/toast";
import { formatNum } from "@/lib/utils";
import { paymentInputSchema } from "@/schemas/payment";
import {
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  useGetPaymentsQuery,
  useUpdatePaymentMutation,
} from "@/services/payment.service";
import { useAppSelector } from "@/store/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Pencil, Trash } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";

interface IPaymentComp {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const Payment = ({ order, setOpen }: IPaymentComp) => {
  const settings = useAppSelector((state) => state.app.setting);
  const [payment, setPayment] = useState<IPayment | undefined>();
  const [packageWeight, setPackageWeight] = useState<number | undefined>(
    order?.packageWeight
  );
  const hasInitializedRef = useRef(false);
  const packageWeightUnit = order?.packageWeightUnit ?? PackageWeightUnit.KG;

  const { data } = useGetPaymentsQuery(
    { noLimit: true, orderId: order?.id ?? "" },
    { skip: !order?.id }
  );
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [updatePayment, { isLoading: isLoadingUpdate }] =
    useUpdatePaymentMutation();
  const [deletePayment, { isLoading: isDeletingPayment }] =
    useDeletePaymentMutation();
  const payments = data?.data.data || [];
  const defaultRedirectLink =
    order?.type === OrderType.SHIPMENT
      ? shipmentsRedirectLink
      : ordersRedirectLink;

  const form = useForm<z.infer<typeof paymentInputSchema>>({
    resolver: zodResolver(paymentInputSchema),
    mode: "onTouched",
    defaultValues: {
      amount: "",
      status: PaymentStatus.PENDING,
      description: "",
      code: "",
      provider: "",
      sendEmail: false,
      redirectLink: defaultRedirectLink,
      datePaid: undefined,
      paymentBreakdown: defaultPaymentBreakdown.map((item) => ({
        ...item,
        unit: "",
        calculatedValue: "",
      })),
    },
  });

  const { control, watch } = form;
  const { fields, remove, replace } = useFieldArray({
    control,
    name: "paymentBreakdown",
  });

  const freightUnitPrice =
    order?.airLocation === AirLocation.HK
      ? settings?.hkPrice ?? 0
      : settings?.gzPrice ?? 0;

  const descriptionPresets = useMemo(() => {
    const orderNumber = order?.orderNumber ?? "order";
    return [
      {
        label: `International Shipping Fee for order ${orderNumber}`,
        value: `International Shipping Fee for order ${orderNumber}`,
      },
      {
        label: `Domestic Delivery Fee for order ${orderNumber}`,
        value: `Domestic Delivery Fee for order ${orderNumber}`,
      },
      {
        label: `Goods Fee for order ${orderNumber}`,
        value: `Goods Fee for order ${orderNumber}`,
      },
    ];
  }, [order?.orderNumber]);

  const getBreakdownValues = useCallback(
    (weightOverride?: number) =>
      calculatePaymentBreakdownValues(
        freightUnitPrice,
        weightOverride ?? packageWeight ?? order?.packageWeight ?? 0
      ),
    [freightUnitPrice, packageWeight, order?.packageWeight]
  );

  // Initialize form only once when order changes
  useEffect(() => {
    if (!order?.id) return;

    if (payment) {
      const breakdown = payment.paymentBreakdown?.length
        ? payment.paymentBreakdown
        : getBreakdownValues();

      form.reset({
        description: payment.description || "",
        amount: payment.baseAmount.toString(),
        status: payment.status as PaymentStatus,
        code: (payment.code as PaymentCodes) || "",
        provider: payment.provider ?? "",
        sendEmail: false,
        redirectLink: payment.redirectLink || defaultRedirectLink,
        datePaid: payment.datePaid ? new Date(payment.datePaid) : undefined,
        paymentBreakdown: breakdown,
      });
      hasInitializedRef.current = true;
    } else if (!hasInitializedRef.current) {
      form.reset({
        description: "",
        amount: "",
        status: PaymentStatus.PENDING,
        code: "",
        provider: "",
        sendEmail: false,
        redirectLink: defaultRedirectLink,
        datePaid: undefined,
        paymentBreakdown: getBreakdownValues(),
      });
      hasInitializedRef.current = true;
    }
  }, [order?.id, payment, form, getBreakdownValues, defaultRedirectLink]);

  useEffect(() => {
    if (order?.packageWeight) {
      setPackageWeight(order.packageWeight);
    }
  }, [order?.packageWeight]);

  const code = watch("code");

  const handleSubmit = async (values: z.infer<typeof paymentInputSchema>) => {
    try {
      const payload = buildCreatePaymentPayload(values, {
        orderId: order?.id,
      });

      const res = payment?.id
        ? await updatePayment({
            id: payment.id,
            data: {
              ...payload,
              paymentBreakdown: payload.paymentBreakdown as Record<
                string,
                string
              >[],
            },
          }).unwrap()
        : await createPayment(payload).unwrap();

      if (res.status === 200) {
        form.reset({
          amount: "",
          status: PaymentStatus.PENDING,
          description: "",
          code: "",
          provider: "",
          sendEmail: false,
          redirectLink: defaultRedirectLink,
          datePaid: undefined,
          paymentBreakdown: emptyPaymentBreakdown,
        });
        setPayment(undefined);
        hasInitializedRef.current = false;
        notify(res.message, "success");
      } else {
        notify(res.message, "error");
      }
    } catch {
      notify("Could not save payment", "error");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CreatePaymentFormFields
            form={form}
            descriptionPresets={descriptionPresets}
          />
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
          <DialogFooter className="mt-10">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => setOpen(false)}
              disabled={isLoading || isLoadingUpdate || isDeletingPayment}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingUpdate || isDeletingPayment}
              className="shadow-none"
            >
              {(isLoading || isLoadingUpdate) && (
                <Icons.spinner className="h-3 w-3 animate-spin mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
      {payments.length > 0 && (
        <div className="mt-6">
          <p className="mb-4 font-semibold">List of Payments</p>
          <div className="flex flex-col gap-4">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[.92rem] text-zinc-500 text-sm">
                    {p.reference}
                  </p>
                  <p className="text-[.92rem]">{p.description}</p>
                  <p className="text-[.92rem]">{formatNum(p.amount)}</p>
                  {p.datePaid && (
                    <p className="text-[.85rem] text-zinc-500 mt-1">
                      Paid: {format(new Date(p.datePaid), "MM/dd/yyyy h:mm a")}
                    </p>
                  )}
                  <div className="mt-2">
                    <PaymentStatusPill status={p.status} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shadow-none"
                    onClick={() => setPayment(p)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    className="shadow-none"
                    disabled={isDeletingPayment}
                    onClick={async () => {
                      try {
                        const res = await deletePayment(p.id).unwrap();
                        if (res.status === 200) {
                          notify(res.message, "success");
                          if (payment?.id === p.id) {
                            setPayment(undefined);
                            hasInitializedRef.current = false;
                          }
                        } else {
                          notify(res.message, "error");
                        }
                      } catch {
                        notify("Could not delete payment", "error");
                      }
                    }}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
