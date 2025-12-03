import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormLabel,
  FormItem,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IOrder, OrderStatus } from "@/interfaces/order.interface";
import { orderStatusInfo } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { generateCode } from "@/lib/utils";
import { shipmentSchema } from "@/schemas/order";
import { useUpdateOrderMutation } from "@/services/order.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

interface IBasic {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const Basic = ({ order, setOpen }: IBasic) => {
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();
  const form = useForm<z.infer<typeof shipmentSchema>>({
    resolver: zodResolver(shipmentSchema),
    mode: "onTouched",
    defaultValues: {
      packageWeight: "",
      trackingNumber: "",
      sendEmail: false,
      status: "",
    },
  });

  const { watch } = form;
  const { errors } = form.formState;

  const handleSubmit = async (values: z.infer<typeof shipmentSchema>) => {
    try {
      const response = await updateOrder({
        id: order?.id,
        data: {
          status: values?.status as OrderStatus,
          trackingNumber: values?.trackingNumber,
          packageWeight: values?.packageWeight
            ? +values.packageWeight
            : undefined,
          sendEmail: values.sendEmail,
        },
      }).unwrap();
      if (response.status === 200) {
        notify(response.message, "success");
      } else {
        notify(response.message, "error");
      }
      setOpen(false);
    } catch (err) {
      notify("Could not save shipment", "error");
    }
  };

  useEffect(() => {
    if (!order) return;
    const packageWeight = order.packageWeight || "";
    const trackingNumber = order.trackingNumber || "";
    const sendEmail = false;
    const status = order.status || "";
    form.reset({
      status,
      packageWeight: packageWeight?.toString() ?? "",
      trackingNumber,
      sendEmail,
    });
  }, [order]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="packageWeight"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Package Weight</FormLabel>
                    <FormControl>
                      <NumericFormat
                        type="text"
                        name="packageWeight"
                        autoCapitalize="none"
                        autoCorrect="off"
                        placeholder="Package Weight"
                        suffix="KG"
                        displayType="input"
                        decimalSeparator="."
                        allowNegative={false}
                        thousandSeparator=","
                        value={field.value ?? ""}
                        onValueChange={(values) => {
                          field.onChange(values.value ?? "");
                        }}
                        onBlur={() => {
                          field.onBlur();
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
              name="trackingNumber"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="name">Tracking Number</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            id="trackingNumber"
                            className="bg-transparent"
                            placeholder="Tracking Number"
                            error={!!errors?.trackingNumber?.message}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          className="h-11 shadow-none"
                          onClick={() => {
                            const tracking = generateCode(11);
                            form.setValue("trackingNumber", tracking);
                          }}
                        >
                          Generate
                        </Button>
                      </div>
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
                          <SelectTrigger className="h-11">
                            <SelectValue
                              placeholder={
                                <span className="text-gray-400">
                                  Select Status
                                </span>
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
                    </div>
                  </FormItem>
                );
              }}
            />
          </div>
          <FormField
            control={form.control}
            name="sendEmail"
            render={({ field }) => {
              return (
                <FormItem className="flex items-center mt-2">
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
                </FormItem>
              );
            }}
          />
        </div>
        {Object.entries(order?.emailsSent ?? {}).length > 0 && (
          <div className="mt-5">
            <p className="text-sm mb-2 font-semibold mt-2">Email Statuses</p>
            <div className="flex flex-col gap-2">
              {Object.entries(order?.emailsSent ?? {}).map(([key, value]) => {
                return (
                  <div key={key} className="text-[.8rem]">
                    <span className="font-semibold">
                      {orderStatusInfo[key as OrderStatus]?.text}
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

export default Basic;
