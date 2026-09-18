import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputDropdown from "@/components/ui/input-dropdown";
import useRate from "@/hooks/use-rate";
import { PackageWeightUnit } from "@/interfaces/order.interface";
import { formatNum } from "@/lib/utils";
import { paymentInputSchema } from "@/schemas/payment";
import { X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
} from "react";
import {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFieldArrayReplace,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";
import {
  defaultPaymentBreakdown,
  getBreakdownUnitsMap,
  PaymentBreakdownType,
} from "./payment-form.constants";

type PaymentFormValues = z.infer<typeof paymentInputSchema>;

interface PaymentBreakdownSectionProps {
  form: UseFormReturn<PaymentFormValues>;
  fields: FieldArrayWithId<PaymentFormValues, "paymentBreakdown", "id">[];
  remove: UseFieldArrayRemove;
  replace: UseFieldArrayReplace<PaymentFormValues, "paymentBreakdown">;
  packageWeight?: number;
  setPackageWeight: Dispatch<SetStateAction<number | undefined>>;
  packageWeightUnit: PackageWeightUnit;
  freightUnitPrice: number;
}

const isUsdBreakdown = (value?: string) =>
  value === PaymentBreakdownType.freight ||
  value === PaymentBreakdownType.packing_fee;

export const calculatePaymentBreakdownValues = (
  freightUnitPrice: number,
  packageWeight = 0
) =>
  defaultPaymentBreakdown.map((item) => {
    let unit = "0";
    let calculatedValue = "0";

    switch (item.value) {
      case PaymentBreakdownType.freight:
        unit = freightUnitPrice.toString();
        calculatedValue = (freightUnitPrice * packageWeight).toString();
        break;
      case PaymentBreakdownType.clearance:
        unit = "1000";
        calculatedValue = (1000 * packageWeight).toString();
        break;
      case PaymentBreakdownType.packing_fee:
        unit = "1";
        calculatedValue = "1";
        break;
    }

    return {
      ...item,
      unit,
      calculatedValue,
    };
  });

export const sumPaymentBreakdownNgn = (
  breakdown: { value?: string; calculatedValue?: string }[],
  usdToNgn: number
) =>
  breakdown.reduce((sum, item) => {
    const value = Number(item.calculatedValue) || 0;
    if (isUsdBreakdown(item.value)) {
      return sum + value * usdToNgn;
    }
    return sum + value;
  }, 0);

export const PaymentBreakdownSection = ({
  form,
  fields,
  remove,
  replace,
  packageWeight,
  setPackageWeight,
  packageWeightUnit,
  freightUnitPrice,
}: PaymentBreakdownSectionProps) => {
  const { control, watch, setValue, getValues } = form;
  const { usdRates, hasUsdRate } = useRate();
  const watchedBreakdowns = useWatch({ control, name: "paymentBreakdown" });

  const getUnits = useCallback(
    (value: string) =>
      getBreakdownUnitsMap(packageWeightUnit)[value] || {
        prefix: "",
        suffix: "",
      },
    [packageWeightUnit]
  );

  const recalculateWithCurrentSettings = useCallback(() => {
    replace(calculatePaymentBreakdownValues(freightUnitPrice, packageWeight));
  }, [freightUnitPrice, packageWeight, replace]);

  const clearAllBreakdown = useCallback(() => {
    replace([]);
  }, [replace]);

  const restoreDefaultBreakdown = useCallback(() => {
    replace(calculatePaymentBreakdownValues(freightUnitPrice, packageWeight));
  }, [freightUnitPrice, packageWeight, replace]);

  useEffect(() => {
    if (fields.length === 0) return;

    const weight = packageWeight ?? 0;
    for (let idx = 0; idx < fields.length; idx++) {
      const item = getValues(`paymentBreakdown.${idx}`);
      if (!item) continue;

      const unit = Number(item.unit);
      if (!Number.isFinite(unit)) continue;

      let calc = unit;
      if (
        item.value === PaymentBreakdownType.freight ||
        item.value === PaymentBreakdownType.clearance
      ) {
        calc = unit * weight;
      }

      const newVal = calc.toFixed(2);
      const currentVal = getValues(`paymentBreakdown.${idx}.calculatedValue`);

      if (currentVal !== newVal) {
        setValue(`paymentBreakdown.${idx}.calculatedValue`, newVal, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [watchedBreakdowns, packageWeight, fields.length, setValue, getValues]);

  useEffect(() => {
    if (!hasUsdRate || fields.length === 0) return;

    const totalNgn = sumPaymentBreakdownNgn(
      getValues("paymentBreakdown") ?? [],
      usdRates
    );
    const nextAmount = Math.ceil(totalNgn).toString();
    if (getValues("amount") !== nextAmount) {
      setValue("amount", nextAmount, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [
    watchedBreakdowns,
    packageWeight,
    fields.length,
    hasUsdRate,
    usdRates,
    getValues,
    setValue,
  ]);

  const breakdownNgnTotal = hasUsdRate
    ? sumPaymentBreakdownNgn(watchedBreakdowns ?? [], usdRates)
    : 0;

  return (
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
            const calculated = Number(
              watch(`paymentBreakdown.${index}.calculatedValue`)
            );
            const ngnEquivalent =
              hasUsdRate && isUsdBreakdown(breakdownValue) && calculated
                ? calculated * usdRates
                : null;

            return (
              <div key={field.id} className="flex flex-col gap-1">
                <div className="flex gap-2 items-start">
                  <FormField
                    control={control}
                    name={`paymentBreakdown.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <InputDropdown
                            {...field}
                            items={defaultPaymentBreakdown}
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
                              setValue(
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
                {ngnEquivalent != null && (
                  <p className="text-xs text-zinc-500 pl-1">
                    ≈ ₦{formatNum(ngnEquivalent)}
                  </p>
                )}
              </div>
            );
          })}
          <div className="rounded-md border bg-zinc-50 px-3 py-2 text-xs text-zinc-600 flex flex-wrap items-center justify-between gap-2">
            {hasUsdRate ? (
              <>
                <span>USD/NGN {formatNum(usdRates)}</span>
                <span className="font-medium text-zinc-900">
                  Amount ₦{formatNum(Math.ceil(breakdownNgnTotal))}
                </span>
              </>
            ) : (
              <span>Set USD/NGN in Settings → Rates to auto-fill amount</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const emptyPaymentBreakdown = defaultPaymentBreakdown.map((item) => ({
  ...item,
  unit: "",
  calculatedValue: "",
}));
