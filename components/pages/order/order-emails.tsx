import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { orderEmailsSchema } from "@/schemas/order";
import z from "zod";
import { IOrderItem, OrderEmails } from "@/interfaces/order.interface";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderEmailsInfo, orderStatusInfo } from "@/lib/constants";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/lib/toast";
import { format } from "date-fns";
import { useSendEmailsMutation } from "@/services/order.service";
type LucideIconName = keyof typeof LucideIcons;

interface IDialogProps {
  open: boolean;
  orders: IOrderItem[];
  onOpenChange: (open: boolean) => void;
}

const OrderEmailsDialog = ({ open, orders, onOpenChange }: IDialogProps) => {
  const [sendEmail, { isLoading }] = useSendEmailsMutation();
  const form = useForm<z.infer<typeof orderEmailsSchema>>({
    resolver: zodResolver(orderEmailsSchema),
    mode: "onTouched",
    defaultValues: {
      emailType: OrderEmails.WAREHOUSE_ARRIVAL,
    },
  });

  const handleSubmit = async (values: z.infer<typeof orderEmailsSchema>) => {
    try {
      const response = await sendEmail({
        items: orders.map((order) => order.id),
        data: {
          emailType: values["emailType"],
        },
      }).unwrap();
      if (response.status === 200) {
        onOpenChange(false);
        notify(response.message, "success");
      }
    } catch (err) {
      console.error(err);
      notify("Failed to send email(s)", "error");
    }
  };

  useEffect(() => {
    form.reset({
      emailType: OrderEmails.WAREHOUSE_ARRIVAL,
    });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <ScrollArea className="max-h-[90vh] h-full">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Send Emails</DialogTitle>
              <DialogDescription>
                Choose from email template to send for these order(s)
              </DialogDescription>
            </DialogHeader>
            <div className="text-gray-600 text-[.8rem] mt-6 mb-2">
              <ul className="list-outside !list-disc ml-3 flex flex-col gap-2">
                {orders.map((order) => {
                  const product = order.product;
                  const name = order.name || product?.description;
                  const status = order.status;
                  const statusInfo = orderStatusInfo[status];
                  const IconComponent = LucideIcons[
                    statusInfo?.icon as LucideIconName
                  ] as LucideIcons.LucideIcon;

                  return (
                    <li key={order.id}>
                      {order.product?.url ? (
                        <a
                          target="_blank"
                          href={order.product.url}
                          className="hover:text-secondary duration-200 transition-colors"
                        >
                          {name}
                        </a>
                      ) : (
                        name
                      )}
                      <span
                        className="rounded-full inline-flex items-center gap-1 px-[10px] py-0.5 text-xs font-medium ml-2 align-middle"
                        style={{
                          backgroundColor: statusInfo?.bgColor,
                          color: statusInfo?.color ?? "#fff",
                        }}
                      >
                        <IconComponent className="size-3 shrink-0" />
                        {statusInfo?.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="flex flex-col gap-4 py-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="emailType"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel htmlFor="status">Email Type</FormLabel>
                            <div className="flex flex-col space-y-1">
                              <FormControl>
                                <Select
                                  {...field}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                  }}
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue
                                      placeholder={
                                        <span className="text-gray-400">
                                          Select Type
                                        </span>
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(OrderEmails).map(
                                      ([key, value]) => (
                                        <SelectItem key={key} value={value}>
                                          {orderEmailsInfo[value]?.text}
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
                  </div>
                </div>
                {orders.length === 1 &&
                  Object.entries(orders[0].emailsSent).length > 0 && (
                    <div>
                      <p className="text-sm mb-2 font-semibold mt-2">
                        Email Statuses
                      </p>
                      <div className="flex flex-col gap-2">
                        {Object.entries(orders[0].emailsSent)
                          .filter(([f]) =>
                            [OrderEmails.WAREHOUSE_ARRIVAL].includes(
                              f as OrderEmails
                            )
                          )
                          .map(([key, value]) => {
                            return (
                              <div key={key} className="text-[.8rem]">
                                <span className="font-semibold">
                                  {orderEmailsInfo[key as OrderEmails]?.text}
                                </span>
                                :{" "}
                                {value.map((v, i) => (
                                  <span key={i}>
                                    {format(v, "MM/dd/yyy h:mm a")}
                                    {i < value.length - 1 && ", "}
                                  </span>
                                ))}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
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
                    Send
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

export default OrderEmailsDialog;
