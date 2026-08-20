import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputDropdown from "@/components/ui/input-dropdown";
import { PackageWeightUnit } from "@/interfaces/order.interface";
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
            );
          })}
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
