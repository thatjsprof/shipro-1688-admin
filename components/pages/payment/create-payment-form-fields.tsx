import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/ui/date";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputDropdown from "@/components/ui/input-dropdown";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaymentCodes,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { paymentProviders, paymentStatus, statusTags } from "@/lib/constants";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { defaultRedirectLinks } from "./payment-form.constants";

type PaymentField =
  | "description"
  | "amount"
  | "code"
  | "redirectLink"
  | "status"
  | "provider"
  | "datePaid"
  | "sendEmail";

interface CreatePaymentFormFieldsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  /** When set, fields bind to `${namePrefix}.field` (e.g. `payments.0`). */
  namePrefix?: string;
  descriptionPresets?: { label: string; value: string }[];
  showDatePaid?: boolean;
  showProvider?: boolean;
}

export const CreatePaymentFormFields = <T extends FieldValues>({
  form,
  namePrefix,
  descriptionPresets = [],
  showDatePaid = true,
  showProvider = true,
}: CreatePaymentFormFieldsProps<T>) => {
  const { control, watch, setValue, getFieldState } = form;
  const hasDescriptionPresets = descriptionPresets.length > 0;

  const fieldName = (field: PaymentField) =>
    (namePrefix ? `${namePrefix}.${field}` : field) as FieldPath<T>;

  const hasError = (field: PaymentField) =>
    !!getFieldState(fieldName(field)).error;

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name={fieldName("description")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <div className="flex flex-col space-y-1">
              <FormControl>
                {hasDescriptionPresets ? (
                  <InputDropdown
                    items={descriptionPresets}
                    type="textarea"
                    placeholder="Description"
                    {...field}
                    onChange={(v) =>
                      setValue(
                        fieldName("description"),
                        v.value.toString() as any
                      )
                    }
                    initialValue={watch(fieldName("description")) as string}
                    error={hasError("description")}
                    className="text-sm placeholder:text-sm !bg-transparent shadow-none w-full"
                  />
                ) : (
                  <Textarea
                    {...field}
                    value={(field.value as string) ?? ""}
                    placeholder="Enter payment description"
                    rows={3}
                    error={hasError("description")}
                  />
                )}
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldName("amount")}
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
                  value={(field.value as string) ?? ""}
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
        name={fieldName("code")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Code</FormLabel>
            <div className="flex flex-col space-y-1">
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        <span className="text-gray-400">
                          Select payment code
                        </span>
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
        name={fieldName("redirectLink")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Redirect Link</FormLabel>
            <div className="flex flex-col space-y-1">
              <FormControl>
                <InputDropdown
                  items={defaultRedirectLinks}
                  type="input"
                  placeholder="Redirect Link"
                  {...field}
                  onChange={(v) =>
                    setValue(
                      fieldName("redirectLink"),
                      v.value.toString() as any
                    )
                  }
                  initialValue={watch(fieldName("redirectLink")) as string}
                  error={hasError("redirectLink")}
                />
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldName("status")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Status</FormLabel>
            <div className="flex flex-col space-y-1">
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        <span className="text-gray-400">
                          Select payment status
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
      {showProvider && (
        <FormField
          control={control}
          name={fieldName("provider")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <div className="flex flex-col space-y-1">
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          <span className="text-gray-400">Select provider</span>
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
      )}
      {showDatePaid && (
        <FormField
          control={control}
          name={fieldName("datePaid")}
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
                        field.value
                          ? new Date(field.value as string | Date)
                          : undefined
                      }
                      buttonClassName="flex-1"
                      placeholder="Date Paid"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    className="h-11 shadow-none"
                    variant="outline"
                    onClick={() =>
                      setValue(fieldName("datePaid"), undefined as any)
                    }
                  >
                    Clear
                  </Button>
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name={fieldName("sendEmail")}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Notification</FormLabel>
            <div className="flex items-center gap-2 mt-2">
              <FormControl>
                <Checkbox
                  name={fieldName("sendEmail")}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={!watch(fieldName("status"))}
                />
              </FormControl>
              <FormLabel
                htmlFor={fieldName("sendEmail")}
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
  );
};
