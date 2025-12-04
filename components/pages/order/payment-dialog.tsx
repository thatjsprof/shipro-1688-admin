import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  PaymentAltFormData,
  PaymentAltFormInput,
  paymentInputSchema,
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
import { PaymentStatus, PaymentCodes } from "@/interfaces/payment.interface";
import { NumericFormat } from "react-number-format";
import { Icons } from "@/components/shared/icons";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PaymentAltFormData) => void;
  isLoading?: boolean;
}

export const PaymentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: PaymentDialogProps) => {
  const form = useForm<PaymentAltFormInput, any, PaymentAltFormData>({
    resolver: zodResolver(paymentInputSchema) as any,
    mode: "onTouched",
    defaultValues: {
      amount: "",
      status: PaymentStatus.PENDING,
      description: "",
      code: undefined,
    },
  });

  const handleSubmit = async (data: PaymentAltFormInput) => {};

  useEffect(() => {
    if (!open) {
      form.reset({
        amount: "",
        status: PaymentStatus.PENDING,
        description: "",
        code: undefined,
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create Payment</DialogTitle>
          <DialogDescription>
            Add a new payment record for this order item.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[90vh]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex flex-col gap-4 py-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => {
                    return (
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
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PaymentStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                        <FormLabel>Payment Code</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment code" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PaymentCodes).map((code) => (
                              <SelectItem key={code} value={code}>
                                {code.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter payment description"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
