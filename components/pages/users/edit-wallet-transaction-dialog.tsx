import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ActionTypes,
  IWalletTransation,
  WalletTransactionStatus,
} from "@/interfaces/wallet.interface";
import { Icons } from "@/components/shared/icons";
import { useUpdateWalletTransactionMutation } from "@/services/wallet.service";
import { notify } from "@/lib/toast";
import { formatNum } from "@/lib/utils";

const editWalletTransactionSchema = z.object({
  status: z.nativeEnum(WalletTransactionStatus),
  addAmountToWallet: z.boolean(),
  sendEmail: z.boolean(),
});

type EditWalletTransactionFormValues = z.infer<
  typeof editWalletTransactionSchema
>;

const STATUS_LABELS: Record<WalletTransactionStatus, string> = {
  [WalletTransactionStatus.PENDING]: "Pending",
  [WalletTransactionStatus.SUCCESSFUL]: "Successful",
  [WalletTransactionStatus.FAILED]: "Failed",
};

interface EditWalletTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: IWalletTransation | null;
}

const EditWalletTransactionDialog = ({
  open,
  onOpenChange,
  transaction,
}: EditWalletTransactionDialogProps) => {
  const [updateWalletTransaction, { isLoading }] =
    useUpdateWalletTransactionMutation();
  const isCredit = transaction?.type === ActionTypes.CREDIT;

  const form = useForm<EditWalletTransactionFormValues>({
    resolver: zodResolver(editWalletTransactionSchema),
    mode: "onTouched",
    defaultValues: {
      status: WalletTransactionStatus.PENDING,
      addAmountToWallet: false,
      sendEmail: false,
    },
  });

  const status = form.watch("status");
  const isSuccessful = status === WalletTransactionStatus.SUCCESSFUL;

  useEffect(() => {
    if (open && transaction) {
      form.reset({
        status: transaction.status,
        addAmountToWallet: false,
        sendEmail: false,
      });
    }
  }, [open, transaction, form]);

  useEffect(() => {
    if (!isSuccessful) {
      form.setValue("sendEmail", false);
      form.setValue("addAmountToWallet", false);
    }
  }, [isSuccessful, form]);

  const handleSubmit = async (data: EditWalletTransactionFormValues) => {
    if (!transaction?.id) return;
    try {
      const res = await updateWalletTransaction({
        id: transaction.id,
        status: data.status,
        addAmountToWallet: isCredit ? data.addAmountToWallet : false,
        sendEmail: data.sendEmail,
      }).unwrap();
      if (res.status === 200) {
        onOpenChange(false);
        notify(res.message ?? "Wallet transaction updated", "success");
      } else {
        notify(res.message ?? "Failed to update wallet transaction", "error");
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Could not update wallet transaction";
      notify(message, "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Wallet Transaction</DialogTitle>
          <DialogDescription>
            Update this transaction status
            {transaction
              ? ` for ₦${formatNum(transaction.amount)} (${transaction.reference}).`
              : "."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
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
                      {Object.values(WalletTransactionStatus).map((value) => (
                        <SelectItem key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isCredit && (
              <FormField
                control={form.control}
                name="addAmountToWallet"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        id="addAmountToWallet"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        className="shadow-none mt-0.5"
                        disabled={!isSuccessful}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel
                        className="text-nowrap font-medium"
                        htmlFor="addAmountToWallet"
                      >
                        Add amount to wallet
                      </FormLabel>
                      <FormDescription className="text-xs text-gray-500">
                        Credit this transaction amount to the wallet without
                        creating a new transaction.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="sendEmail"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      id="sendEmail"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      className="shadow-none mt-0.5"
                      disabled={!isSuccessful}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel
                      className="text-nowrap font-medium"
                      htmlFor="sendEmail"
                    >
                      Send email
                    </FormLabel>
                    <FormDescription className="text-xs text-gray-500">
                      Sends the existing{" "}
                      {isCredit ? "credit" : "debit"} email. Only sent when
                      status is successful.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
};

export default EditWalletTransactionDialog;
