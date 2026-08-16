import { Icons } from "@/components/shared/icons";
import { PaymentStatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputDropdown from "@/components/ui/input-dropdown";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AirLocation,
  IOrder,
  PackageWeightUnit,
} from "@/interfaces/order.interface";
import {
  IPayment,
  PaymentCodes,
  PaymentModules,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { paymentProviders, paymentStatus, statusTags } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { formatNum } from "@/lib/utils";
import { paymentInputSchema } from "@/schemas/payment";
import DatePicker from "@/components/ui/date";
import {
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  useGetPaymentsQuery,
  useUpdatePaymentMutation,
} from "@/services/payment.service";
import { useAppSelector } from "@/store/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Pencil, Trash, X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

interface IPaymentComp {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

enum IBreakdown {
  freight = "freight",
  packing_fee = "packing_fee",
  clearance = "clearance",
}

const defaultBreakdown = [
  { label: "Freight", value: IBreakdown.freight },
  { label: "Packing Fee", value: IBreakdown.packing_fee },
  { label: "Clearance", value: IBreakdown.clearance },
];

const getUnitsMap = (
  packageWeightUnit: PackageWeightUnit
): Record<string, { prefix: string; suffix: string }> => ({
  [IBreakdown.freight]: {
    prefix: "$",
    suffix: ` / ${packageWeightUnit.toUpperCase()}`,
  },
  [IBreakdown.clearance]: {
    prefix: "₦",
    suffix: ` / ${packageWeightUnit.toUpperCase()}`,
  },
  [IBreakdown.packing_fee]: { prefix: "$", suffix: " / Piece" },
});

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
      paymentBreakdown: defaultBreakdown,
    },
  });

  const { control, watch, setValue } = form;
  const { fields, remove, replace } = useFieldArray({
    control,
    name: "paymentBreakdown",
  });

  const price =
    order?.airLocation === AirLocation.HK
      ? settings?.hkPrice
      : settings?.gzPrice;

  const calculateBreakdownValues = useCallback(
    (weightOverride?: number) => {
      const weight = weightOverride ?? packageWeight ?? 0;
      return defaultBreakdown.map((b) => {
        let unit = "0";
        let calculatedValue = "0";

        switch (b.value) {
          case IBreakdown.freight:
            unit = (price ?? 0).toString();
            calculatedValue = ((price ?? 0) * weight).toString();
            break;
          case IBreakdown.clearance:
            unit = "1000";
            calculatedValue = (1000 * weight).toString();
            break;
          case IBreakdown.packing_fee:
            unit = "1";
            calculatedValue = "1";
            break;
        }

        return {
          ...b,
          unit,
          calculatedValue,
        };
      });
    },
    [price, packageWeight]
  );

  const recalculateWithCurrentSettings = useCallback(() => {
    if (order?.packageWeight) {
      setPackageWeight(order.packageWeight);
    }
    replace(calculateBreakdownValues(order?.packageWeight));
  }, [order?.packageWeight, calculateBreakdownValues, replace]);

  const clearAllBreakdown = useCallback(() => {
    replace([]);
  }, [replace]);

  const restoreDefaultBreakdown = useCallback(() => {
    replace(calculateBreakdownValues());
  }, [calculateBreakdownValues, replace]);

  // Initialize form only once when order changes
  useEffect(() => {
    if (!order?.id) return;

    if (payment) {
      const breakdown = payment.paymentBreakdown?.length
        ? payment.paymentBreakdown
        : calculateBreakdownValues();

      form.reset({
        description: payment.description || "",
        amount: payment.baseAmount.toString(),
        status: payment.status as PaymentStatus,
        code: (payment.code as PaymentCodes) || "",
        provider: payment.provider || PaymentProviders.PAYSTACK,
        sendEmail: false,
        redirectLink: "",
        datePaid: payment.datePaid ? new Date(payment.datePaid) : undefined,
        paymentBreakdown: breakdown,
      });
      hasInitializedRef.current = true;
    } else if (!hasInitializedRef.current) {
      const calculated = calculateBreakdownValues();
      form.reset({
        description: "",
        amount: "",
        status: PaymentStatus.PENDING,
        code: "",
        provider: PaymentProviders.PAYSTACK,
        sendEmail: false,
        redirectLink: "",
        datePaid: undefined,
        paymentBreakdown: calculated,
      });
      hasInitializedRef.current = true;
    }
  }, [order?.id, payment]);

  // Update package weight when order changes
  useEffect(() => {
    if (order?.packageWeight) {
      setPackageWeight(order.packageWeight);
    }
  }, [order?.packageWeight]);

  const code = watch("code");
  const watchedBreakdowns = useWatch({ control, name: "paymentBreakdown" });

  useEffect(() => {
    if (code !== PaymentCodes.SHIPPING_FEE || fields.length === 0) return;

    const weight = packageWeight ?? 0;
    for (let idx = 0; idx < fields.length; idx++) {
      const item = form.getValues(`paymentBreakdown.${idx}`);
      if (!item) continue;

      const unit = Number(item.unit);
      if (!Number.isFinite(unit)) continue;

      let calc = unit;
      if (
        item.value === IBreakdown.freight ||
        item.value === IBreakdown.clearance
      ) {
        calc = unit * weight;
      }

      const newVal = calc.toFixed(2);
      const currentVal = form.getValues(
        `paymentBreakdown.${idx}.calculatedValue`
      );

      if (currentVal !== newVal) {
        setValue(`paymentBreakdown.${idx}.calculatedValue`, newVal, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [watchedBreakdowns, code, packageWeight, fields.length, setValue, form]);

  const getUnits = useCallback(
    (value: string) =>
      getUnitsMap(packageWeightUnit)[value] || { prefix: "", suffix: "" },
    [packageWeightUnit]
  );

  const handleSubmit = async (values: z.infer<typeof paymentInputSchema>) => {
    try {
      const payload = {
        description: values.description,
        amount: +values.amount,
        baseAmount: +values.amount,
        module: PaymentModules.ORDER,
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
      };

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
        : await createPayment({ ...payload, orderId: order?.id }).unwrap();

      if (res.status === 200) {
        form.reset({
          amount: "",
          status: PaymentStatus.PENDING,
          description: "",
          code: "",
          provider: PaymentProviders.PAYSTACK,
          sendEmail: false,
          redirectLink: "",
          datePaid: undefined,
          paymentBreakdown: defaultBreakdown.map((b) => ({
            ...b,
            unit: "",
            calculatedValue: "",
          })),
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
          <div className="flex flex-col gap-4">
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <InputDropdown
                        items={[
                          {
                            label: `International Shipping Fee for order ${order?.orderNumber}`,
                            value: `International Shipping Fee for order ${order?.orderNumber}`,
                          },
                          {
                            label: `Domestic Delivery Fee for order ${order?.orderNumber}`,
                            value: `Domestic Delivery Fee for order ${order?.orderNumber}`,
                          },
                          {
                            label: `Goods Fee for order ${order?.orderNumber}`,
                            value: `Goods Fee for order ${order?.orderNumber}`,
                          },
                        ]}
                        type="textarea"
                        placeholder="Description"
                        {...field}
                        onChange={(v) =>
                          form.setValue("description", v.value.toString())
                        }
                        initialValue={watch("description")}
                        error={!!form.formState.errors.description}
                        className="text-sm placeholder:text-sm !bg-transparent shadow-none w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <NumericFormat
                        prefix="₦"
                        thousandSeparator=","
                        decimalSeparator="."
                        allowNegative={false}
                        value={field.value ?? ""}
                        onValueChange={(v) => field.onChange(v.value ?? "")}
                        onBlur={field.onBlur}
                        customInput={Input}
                        className="h-10"
                        placeholder="Amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue
                            placeholder={
                              <span className="text-gray-400">Select Code</span>
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PaymentCodes).map(([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {statusTags[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="redirectLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redirect Link</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <InputDropdown
                        items={[
                          {
                            label: "Warehouse",
                            value: `${process.env.CLIENT_URL}/orders?tab=warehouse`,
                          },
                          {
                            label: "Orders",
                            value: `${process.env.CLIENT_URL}/orders?tab=placed`,
                          },
                          {
                            label: "Shipments",
                            value: `${process.env.CLIENT_URL}/orders?tab=shipments`,
                          },
                        ]}
                        type="input"
                        placeholder="Redirect Link"
                        {...field}
                        onChange={(v) =>
                          form.setValue("redirectLink", v.value.toString())
                        }
                        initialValue={watch("redirectLink")}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue
                            placeholder={
                              <span className="text-gray-400">
                                Select Status
                              </span>
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PaymentStatus).map(([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {paymentStatus[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue
                            placeholder={
                              <span className="text-gray-400">
                                Select Provider
                              </span>
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PaymentProviders).map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {paymentProviders[provider]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="datePaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Paid</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <DatePicker
                          {...field}
                          enableTime
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          buttonClassName="flex-1"
                          placeholder="Date Paid"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        className="h-11 shadow-none"
                        variant="outline"
                        onClick={() => form.setValue("datePaid", undefined)}
                      >
                        Clear
                      </Button>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="sendEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Notification</FormLabel>
                  <div className="flex items-center gap-2 mt-2">
                    <FormControl>
                      <Checkbox
                        name="sendEmail"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        disabled={!watch("status")}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="sendEmail"
                      className="text-nowrap cursor-pointer"
                      onClick={() => field.onChange(!field.value)}
                    >
                      Send Email
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          {code === PaymentCodes.SHIPPING_FEE && (
            <div className="mt-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <FormLabel className="shrink-0 whitespace-nowrap">
                  Payment Breakdown
                </FormLabel>
                {fields.length > 0 && (
                  <div className="flex flex-wrap items-end gap-2 sm:justify-end">
                    <div className="flex flex-col gap-1">
                      <FormLabel className="text-xs whitespace-nowrap">
                        Package Weight ({packageWeightUnit.toUpperCase()})
                      </FormLabel>
                      <NumericFormat
                        thousandSeparator=","
                        decimalSeparator="."
                        allowNegative={false}
                        decimalScale={2}
                        value={packageWeight ?? ""}
                        onValueChange={(v) => {
                          setPackageWeight(v.floatValue);
                        }}
                        customInput={Input}
                        className="h-10 w-32"
                        placeholder="Weight"
                      />
                    </div>
                    <Button
                      className="shadow-none h-10"
                      variant="outline"
                      type="button"
                      onClick={recalculateWithCurrentSettings}
                    >
                      Recalculate
                    </Button>
                    <Button
                      className="shadow-none h-10"
                      variant="outline"
                      type="button"
                      onClick={clearAllBreakdown}
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              {fields.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  <p>No payment breakdown</p>
                  <Button
                    className="shadow-none h-9 mt-3"
                    variant="outline"
                    type="button"
                    onClick={restoreDefaultBreakdown}
                  >
                    Restore defaults
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {fields.map((field, index) => {
                    const breakdownValue = watch(
                      `paymentBreakdown.${index}.value`
                    ) as string;
                    const units = getUnits(breakdownValue);

                    return (
                      <div key={field.id} className="flex gap-2 items-start">
                        <FormField
                          control={control}
                          name={`paymentBreakdown.${index}.label`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <InputDropdown
                                  {...field}
                                  items={defaultBreakdown}
                                  disabled
                                  initialValue={watch(
                                    `paymentBreakdown.${index}.label`
                                  )}
                                  placeholder="Label"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`paymentBreakdown.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <NumericFormat
                                  prefix={units.prefix}
                                  suffix={units.suffix}
                                  thousandSeparator=","
                                  decimalSeparator="."
                                  allowNegative={false}
                                  value={field.value ?? ""}
                                  onValueChange={(v) =>
                                    form.setValue(
                                      `paymentBreakdown.${index}.unit`,
                                      v.floatValue?.toString() || ""
                                    )
                                  }
                                  customInput={Input}
                                  className="h-11"
                                  placeholder="Unit"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`paymentBreakdown.${index}.calculatedValue`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <NumericFormat
                                  prefix={units.prefix}
                                  thousandSeparator=","
                                  decimalSeparator="."
                                  allowNegative={false}
                                  value={field.value ?? ""}
                                  disabled
                                  customInput={Input}
                                  className="h-11"
                                  placeholder="Calculated"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-11"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
