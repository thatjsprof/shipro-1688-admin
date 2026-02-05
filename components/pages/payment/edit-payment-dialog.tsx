import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  EditPaymentFormInput,
  editPaymentInputSchema,
} from "@/schemas/payment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  IPayment,
  PaymentProviders,
  PaymentStatus,
} from "@/interfaces/payment.interface";
import { paymentProviders } from "@/lib/constants";
import { NumericFormat } from "react-number-format";
import { Icons } from "@/components/shared/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import DatePicker from "@/components/ui/date";
import { useUpdatePaymentMutation } from "@/services/payment.service";
import { notify } from "@/lib/toast";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: IPayment | null;
  onSuccess?: () => void;
}

export const EditPaymentDialog = ({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: EditPaymentDialogProps) => {
  const [updatePayment, { isLoading }] = useUpdatePaymentMutation();

  const form = useForm<EditPaymentFormInput>({
    resolver: zodResolver(editPaymentInputSchema),
    mode: "onTouched",
    defaultValues: {
      description: "",
      amount: "",
      status: PaymentStatus.SUCCESSFUL,
      provider: PaymentProviders.PAYSTACK,
      datePaid: undefined,
    },
  });

  useEffect(() => {
    if (open && payment) {
      form.reset({
        description: payment.description ?? "",
        amount: payment.baseAmount?.toString() ?? "",
        status: payment.status,
        provider: payment.provider,
        datePaid: payment.datePaid
          ? new Date(payment.datePaid)
          : undefined,
      });
    }
  }, [open, payment, form]);

  const handleSubmit = async (data: EditPaymentFormInput) => {
    if (!payment?.id) return;
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      const res = await updatePayment({
        id: payment.id,
        data: {
          description: data.description,
          baseAmount: amount,
          status: data.status,
          provider: data.provider,
          datePaid: data.datePaid ?? undefined,
        },
      }).unwrap();
      if (res.status === 200) {
        onOpenChange(false);
        notify(res.message ?? "Payment updated", "success");
        onSuccess?.();
      } else {
        notify(res.message ?? "Failed to update payment", "error");
      }
    } catch {
      notify("Could not save payment", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0">
        <ScrollArea className="h-full max-h-[calc(90vh-8rem)]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
              <DialogDescription>
                Update payment details. Changes will be saved when you click Save.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="flex flex-col gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter payment description"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <NumericFormat
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            placeholder="Amount"
                            prefix="₦"
                            displayType="input"
                            decimalSeparator="."
                            allowNegative={false}
                            thousandSeparator=","
                            {...field}
                            value={field.value ?? ""}
                            onValueChange={(values) => {
                              field.onChange(
                                values.floatValue?.toString() ?? ""
                              );
                            }}
                            className="h-10"
                            customInput={Input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PaymentStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {{
                                  [PaymentStatus.SUCCESSFUL]: "Successful",
                                  [PaymentStatus.PENDING]: "Pending",
                                  [PaymentStatus.FAILED]: "Failed",
                                  [PaymentStatus.CANCELLED]: "Cancelled",
                                }[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PaymentProviders).map((provider) => (
                              <SelectItem key={provider} value={provider}>
                                {paymentProviders[provider]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="datePaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Paid</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ?? undefined}
                            enableTime
                            onChange={(date) => field.onChange(date ?? undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
