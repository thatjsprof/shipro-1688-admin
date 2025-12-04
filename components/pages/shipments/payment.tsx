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
import { Textarea } from "@/components/ui/textarea";
import { IOrder } from "@/interfaces/order.interface";
import {
  IPayment,
  PaymentCodes,
  PaymentModules,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { paymentStatus, statusTags } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { formatNum } from "@/lib/utils";
import { paymentInputSchema } from "@/schemas/payment";
import {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useUpdatePaymentMutation,
} from "@/services/payment.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

interface IPaymentComp {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const Payment = ({ order, setOpen }: IPaymentComp) => {
  const [payment, setPayment] = useState<IPayment>();
  const { data } = useGetPaymentsQuery(
    {
      noLimit: true,
      orderId: order?.id ?? "",
    },
    { skip: !order?.id }
  );
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [updatePayment, { isLoading: isLoadingUpdate }] =
    useUpdatePaymentMutation();
  const payments = data?.data.data || [];
  const form = useForm<z.infer<typeof paymentInputSchema>>({
    resolver: zodResolver(paymentInputSchema),
    mode: "onTouched",
    defaultValues: {
      amount: "",
      status: PaymentStatus.PENDING,
      description: "",
      code: "",
      sendEmail: false,
    },
  });

  const { watch } = form;
  const { errors } = form.formState;
  console.log(errors);

  const handleSubmit = async (values: z.infer<typeof paymentInputSchema>) => {
    try {
      let response: ApiResponse<IPayment>;
      if (payment?.id) {
        response = await updatePayment({
          id: payment.id,
          data: {
            description: values.description,
            amount: +values.amount,
            module: PaymentModules.ORDER,
            status: values.status as PaymentStatus,
            code: values.code as PaymentCodes,
          },
        }).unwrap();
      } else {
        response = await createPayment({
          description: values.description,
          amount: +values.amount,
          module: PaymentModules.ORDER,
          status: values.status as PaymentStatus,
          orderId: order?.id,
          code: values.code as PaymentCodes,
        }).unwrap();
      }

      if (response.status === 200) {
        form.reset({
          amount: "",
          status: PaymentStatus.PENDING,
          description: "",
          code: "",
          sendEmail: false,
        });
        setPayment(undefined);
        notify(response.message, "success");
      } else {
        notify(response.message, "error");
      }
    } catch (err) {
      notify("could not save payment", "error");
    }
  };

  useEffect(() => {
    if (!payment) return;
    form.reset({
      description: payment.description,
      amount: payment.amount.toString(),
      status: payment.status as PaymentStatus,
      code: (payment.code as PaymentCodes) || "",
      sendEmail: false,
    });
  }, [payment]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="description"
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
                                  label: "Shipping Fee",
                                  value: "Shipping Fee",
                                },
                              ]}
                              type="textarea"
                              placeholder="Description"
                              {...field}
                              error={!!form.formState.errors.description}
                              className="p-4 px-4 text-sm placeholder:text-sm !bg-transparent shadow-none w-full"
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
                name="amount"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="name">Amount</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
                          <FormControl>
                            <NumericFormat
                              type="text"
                              name="amount"
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
                                if (!values.value) return;
                                field.onChange(values.value ?? "");
                              }}
                              onBlur={() => {
                                field.onBlur();
                              }}
                              error={!!errors.amount}
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
                name="code"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="code">Code</FormLabel>
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
                              error={!!errors.code}
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
                name="status"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="status">Status</FormLabel>
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
                              error={!!errors.status}
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
                name="sendEmail"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="status">Email Notification</FormLabel>
                      <div className="flex items-center gap-2 mt-2">
                        <FormControl>
                          <Checkbox
                            id="sendEmail"
                            checked={form.watch("sendEmail")}
                            onCheckedChange={field.onChange}
                            className="shadow-none"
                            disabled={!watch("status")}
                          />
                        </FormControl>
                        <FormLabel className="text-nowrap" htmlFor="sendEmail">
                          Send Email
                        </FormLabel>
                      </div>
                    </FormItem>
                  );
                }}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading || isLoadingUpdate}
                className="shadow-none h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isLoadingUpdate}
                className="shadow-none h-11"
              >
                {(isLoading || isLoadingUpdate) && (
                  <Icons.spinner className="h-3 w-3 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </div>
          {payments.length > 0 && (
            <div className="mt-6">
              <p className="mb-4 font-semibold">List of Payments</p>
              {payments.map((p) => {
                return (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[.92rem]">{p.description}</p>
                      <p className="text-[.92rem]">{formatNum(p.amount)}</p>
                      <div className="mt-2 flex-nowrap">
                        <PaymentStatusPill status={p.status} />
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="shadow-none"
                        onClick={() => {
                          setPayment(p);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="shadow-none"
                        type="button"
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default Payment;
