import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/toast";
import {
  useCreateCreditMutation,
  useCreateDebitMutation,
} from "@/services/wallet.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import * as z from "zod";

const walletAdjustmentSchema = z.object({
  note: z.string().min(1, "Note is required"),
  amount: z.string().min(1, "Amount is required"),
});

type WalletAdjustmentFormValues = z.infer<typeof walletAdjustmentSchema>;

type AdjustmentType = "debit" | "credit";

const ADJUSTMENT_CONFIG: Record<
  AdjustmentType,
  {
    notePlaceholder: string;
    submitLabel: string;
    failureMessage: string;
  }
> = {
  debit: {
    notePlaceholder: "e.g Additional notes about this debit",
    submitLabel: "Debit Wallet",
    failureMessage: "Wallet could not be debited",
  },
  credit: {
    notePlaceholder: "e.g Additional notes about this credit",
    submitLabel: "Credit Wallet",
    failureMessage: "Wallet could not be credited",
  },
};

interface WalletAdjustmentProps {
  userId: string;
}

const WalletAdjustment = ({ userId }: WalletAdjustmentProps) => {
  const [activeTab, setActiveTab] = useState<AdjustmentType>("debit");
  const [debitWallet, { isLoading: isDebitLoading }] = useCreateDebitMutation();
  const [creditWallet, { isLoading: isCreditLoading }] =
    useCreateCreditMutation();

  const form = useForm<WalletAdjustmentFormValues>({
    resolver: zodResolver(walletAdjustmentSchema),
    mode: "onTouched",
    defaultValues: { note: "", amount: "" },
  });

  const config = ADJUSTMENT_CONFIG[activeTab];
  const isLoading = activeTab === "debit" ? isDebitLoading : isCreditLoading;

  const handleTabChange = (value: string) => {
    setActiveTab(value as AdjustmentType);
    form.reset({ note: "", amount: "" });
  };

  const onSubmit = async (data: WalletAdjustmentFormValues) => {
    const payload = {
      description: data.note,
      amount: +data.amount,
      userId,
    };

    try {
      const response =
        activeTab === "debit"
          ? await debitWallet(payload).unwrap()
          : await creditWallet(payload).unwrap();

      if (response.status === 200) {
        notify(response.message, "success");
        form.reset({ note: "", amount: "" });
      } else {
        notify(response.message, "error");
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        config.failureMessage;
      notify(message, "error");
    }
  };

  return (
    <div className="mt-14 border rounded-lg p-8 px-7 pt-6">
      <h2 className="font-semibold mb-4">Adjust Wallet</h2>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="gap-6"
      >
        <TabsList>
          <TabsTrigger value="debit">Debit Wallet</TabsTrigger>
          <TabsTrigger value="credit">Credit Wallet</TabsTrigger>
        </TabsList>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`${activeTab}-note`}>Notes</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <Textarea
                        {...field}
                        id={`${activeTab}-note`}
                        rows={5}
                        error={!!form.formState.errors.note}
                        className="!bg-transparent hover:border-zinc-400 placeholder:text-gray-400 shadow-none"
                        placeholder={config.notePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`${activeTab}-amount`}>Amount</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <div className="flex gap-2">
                      <FormControl>
                        <NumericFormat
                          type="text"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="Amount"
                          displayType="input"
                          decimalSeparator="."
                          allowNegative={false}
                          thousandSeparator=","
                          prefix="₦"
                          onValueChange={(values) => {
                            field.onChange(values.value ?? "");
                          }}
                          className="h-11 !bg-transparent hover:border-zinc-400 placeholder:text-gray-400 shadow-none"
                          customInput={Input}
                          error={!!form.formState.errors.amount}
                          onBlur={field.onBlur}
                          value={field.value}
                          name={`${activeTab}-amount`}
                        />
                      </FormControl>
                      <Button
                        type="submit"
                        className="shadow-none h-11 font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading && (
                          <Icons.spinner className="h-3 w-3 animate-spin" />
                        )}
                        {config.submitLabel}
                      </Button>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default WalletAdjustment;
