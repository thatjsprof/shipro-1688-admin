import { Icons } from "@/components/shared/icons";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IOrder, OrderStatus } from "@/interfaces/order.interface";
import { orderStatusInfo } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { orderStatusOnlySchema } from "@/schemas/order";
import { useUpdateOrderMutation } from "@/services/order.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface IOrderBasic {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const OrderBasic = ({ order, setOpen }: IOrderBasic) => {
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();
  const form = useForm<z.infer<typeof orderStatusOnlySchema>>({
    resolver: zodResolver(orderStatusOnlySchema),
    mode: "onTouched",
    defaultValues: {
      status: "",
      itemsStatus: "none",
      sendEmail: false,
      emailNote: "",
    },
  });
  const { watch } = form;
  const itemsStatus = watch("itemsStatus");
  const canSendEmail = !!watch("status") && itemsStatus !== "none" && !!itemsStatus;

  const handleSubmit = async (values: z.infer<typeof orderStatusOnlySchema>) => {
    try {
      const itemsStatus =
        values.itemsStatus && values.itemsStatus !== "none"
          ? (values.itemsStatus as OrderStatus)
          : undefined;

      const response = await updateOrder({
        id: order?.id,
        data: {
          status: values.status as OrderStatus,
          ...(itemsStatus ? { itemsStatus } : {}),
          sendEmail: !!values.sendEmail,
          emailNote: values.sendEmail
            ? values.emailNote?.trim() || undefined
            : undefined,
        },
      }).unwrap();
      if (response.status === 200) {
        notify(response.message, "success");
      } else {
        notify(response.message, "error");
      }
      setOpen(false);
    } catch {
      notify("Could not save order", "error");
    }
  };

  useEffect(() => {
    if (!order) return;
    form.reset({
      status: order.status || "",
      itemsStatus: "none",
      sendEmail: false,
      emailNote: "",
    });
  }, [order, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="status">Order status</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    onValueChange={(value) => {
                      if (!value) return;
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          <span className="text-gray-400">Select status</span>
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OrderStatus).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {orderStatusInfo[value]?.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="itemsStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="itemsStatus">Order items status</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    onValueChange={(value) => {
                      if (!value) return;
                      field.onChange(value);
                      if (value === "none") {
                        form.setValue("sendEmail", false);
                        form.setValue("emailNote", "");
                      }
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          <span className="text-gray-400">
                            Don&apos;t update items
                          </span>
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Don&apos;t update items</SelectItem>
                      {Object.entries(OrderStatus).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {orderStatusInfo[value]?.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sendEmail"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Checkbox
                    id="sendEmail"
                    checked={!!field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        form.setValue("emailNote", "");
                      }
                    }}
                    className="shadow-none"
                    disabled={!canSendEmail}
                  />
                </FormControl>
                <FormLabel className="text-nowrap" htmlFor="sendEmail">
                  Send Email
                </FormLabel>
              </FormItem>
            )}
          />
          {watch("sendEmail") && (
            <FormField
              control={form.control}
              name="emailNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="emailNote">Email Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="emailNote"
                      rows={4}
                      value={field.value ?? ""}
                      className="!bg-transparent hover:border-zinc-400 placeholder:text-gray-400 shadow-none"
                      placeholder="Optional note to include in the email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
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
            {isLoading && <Icons.spinner className="h-3 w-3 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default OrderBasic;
