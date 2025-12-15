import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentCodes, PaymentStatus } from "@/interfaces/payment.interface";
import { paymentStatus, statusTags } from "@/lib/constants";
import { createOrderSchema } from "@/schemas/new-order.schema";
import { Plus, X } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

interface IPaymentProps {
  form: UseFormReturn<z.infer<typeof createOrderSchema>>;
}

const Payment = ({ form }: IPaymentProps) => {
  const { watch } = form;
  const { errors } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  return (
    <div>
      {fields.map((_, idx) => {
        return (
          <div className="my-4 border rounded-lg p-6 pt-5 relative" key={_.id}>
            <p className="mb-5 font-semibold">
              {_.description || `Payment ${idx + 1}`}
            </p>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name={`payments.${idx}.description`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
                          <FormControl>
                            <InputDropdown
                              items={[
                                {
                                  label: `Shipping Fee`,
                                  value: `Shipping Fee`,
                                },
                              ]}
                              type="textarea"
                              placeholder="Description"
                              {...field}
                              onChange={(v) => {
                                form.setValue(
                                  `payments.${idx}.description`,
                                  v.value.toString()
                                );
                              }}
                              initialValue={form.watch(
                                `payments.${idx}.description`
                              )}
                              error={
                                !!form.formState.errors.payments?.[idx]
                                  ?.description?.message
                              }
                              className="text-sm placeholder:text-sm !bg-transparent shadow-none w-full"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name={`payments.${idx}.amount`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="name">Amount</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
                          <FormControl>
                            <NumericFormat
                              type="text"
                              name={`payments.${idx}.amount`}
                              autoCapitalize="none"
                              autoCorrect="off"
                              placeholder="Amount"
                              prefix="₦"
                              displayType="input"
                              decimalSeparator="."
                              allowNegative={false}
                              thousandSeparator=","
                              value={field.value ?? ""}
                              onValueChange={(values) => {
                                if (!values.floatValue) return;
                                field.onChange(values.floatValue ?? "");
                              }}
                              onBlur={() => {
                                field.onBlur();
                              }}
                              disabled={field.disabled}
                              error={!!errors.payments?.[idx]?.amount?.message}
                              className="h-10"
                              customInput={Input}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name={`payments.${idx}.code`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor={`payments.${idx}.code`}>
                        Code
                      </FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={(value) => {
                              if (!value) return;
                              field.onChange(value);
                            }}
                          >
                            <SelectTrigger
                              className="h-11"
                              error={!!errors.payments?.[idx]?.code?.message}
                            >
                              <SelectValue
                                placeholder={
                                  <span className="text-gray-400">
                                    Select Code
                                  </span>
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PaymentCodes).map(
                                ([key, value]) => (
                                  <SelectItem key={key} value={value}>
                                    {statusTags[value]}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name={`payments.${idx}.redirectLink`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Redirect Link</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
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
                              onChange={(v) => {
                                form.setValue(
                                  `payments.${idx}.redirectLink`,
                                  v.value.toString()
                                );
                              }}
                              initialValue={form.watch(
                                `payments.${idx}.redirectLink`
                              )}
                              error={
                                !!form.formState.errors.payments?.[idx]
                                  ?.redirectLink?.message
                              }
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name={`payments.${idx}.status`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor={`payments.${idx}.status`}>
                        Status
                      </FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={(value) => {
                              if (!value) return;
                              field.onChange(value);
                            }}
                          >
                            <SelectTrigger
                              className="h-11"
                              error={!!errors.payments?.[idx]?.status?.message}
                            >
                              <SelectValue
                                placeholder={
                                  <span className="text-gray-400">
                                    Select Status
                                  </span>
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PaymentStatus).map(
                                ([key, value]) => (
                                  <SelectItem key={key} value={value}>
                                    {paymentStatus[value]}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name={`payments.${idx}.sendEmail`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="status">Email Notification</FormLabel>
                      <div className="flex items-center gap-2 mt-2">
                        <FormControl>
                          <Checkbox
                            id={`payments.${idx}.sendEmail`}
                            checked={form.watch(`payments.${idx}.sendEmail`)}
                            onCheckedChange={field.onChange}
                            className="shadow-none"
                            disabled={!watch(`payments.${idx}.status`)}
                          />
                        </FormControl>
                        <FormLabel
                          className="text-nowrap"
                          htmlFor={`payments.${idx}.sendEmail`}
                        >
                          Send Email
                        </FormLabel>
                      </div>
                    </FormItem>
                  );
                }}
              />
              {fields.length > 1 && (
                <div
                  className="absolute right-3 top-3 bg-destructive rounded-full flex items-center justify-center text-white h-6 w-6 cursor-pointer"
                  onClick={() => remove(idx)}
                >
                  <X className="size-4" />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <Button
        variant="outline"
        className="h-11 shadow-none w-full mt-2"
        onClick={() => {
          append({
            amount: "",
            status: PaymentStatus.PENDING,
            description: "",
            redirectLink: "",
            code: "",
            sendEmail: false,
            paymentBreakdown: [],
          });
        }}
      >
        <Plus />
        Add Payment
      </Button>
    </div>
  );
};

export default Payment;
