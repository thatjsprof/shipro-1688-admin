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
import FileUploadButton from "@/hooks/use-file";
import { IFile } from "@/interfaces/file.interface";
import { orderSchema } from "@/schemas/order";
import z from "zod";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { IOrderItem, OrderStatus } from "@/interfaces/order.interface";
import DatePicker from "@/components/ui/date";
import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatusInfo } from "@/lib/constants";
import * as LucideIcons from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateItemsMutation } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/lib/toast";
import { format } from "date-fns";
type LucideIconName = keyof typeof LucideIcons;

interface IDialogProps {
  open: boolean;
  orders: IOrderItem[];
  onOpenChange: (open: boolean) => void;
}

const OrderDialog = ({ open, orders, onOpenChange }: IDialogProps) => {
  const [updateItem, { isLoading }] = useUpdateItemsMutation();
  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    mode: "onTouched",
    defaultValues: {
      pictures: [],
      arrivedWarehouse: undefined,
      packageWeight: "",
      trackingNumber: "",
      sendEmail: false,
      status: undefined,
    },
  });

  const { watch } = form;
  const { errors } = form.formState;

  const handleSubmit = async (values: z.infer<typeof orderSchema>) => {
    try {
      const weight = values["packageWeight"];
      const images = values["pictures"] ?? [];
      const updated = await updateItem({
        items: orders.map((order) => order.id),
        data: {
          status: values["status"] ?? undefined,
          timeArrivedInWarehouse: values["arrivedWarehouse"] ?? undefined,
          trackingNumber: values["trackingNumber"] ?? undefined,
          images: images.length > 0 ? images : undefined,
          packageWeight: weight ? +weight : undefined,
          sendEmail: values["sendEmail"],
        },
      }).unwrap();
      if (updated.status === 200) {
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      notify("Failed to update this order(s)");
    }
  };

  const pictures = form.watch(`pictures`) ?? [];

  useEffect(() => {
    form.reset();
  }, [open]);

  useEffect(() => {
    if (orders.length === 1) {
      const order = orders[0];
      const pictures = order.images ?? [];
      const arrivedWarehouse = order.timeArrivedInWarehouse
        ? new Date(order.timeArrivedInWarehouse)
        : undefined;
      const packageWeight = order.packageWeight;
      const trackingNumber = order.trackingNumber;
      const sendEmail = false;
      const status = order.status;
      form.reset({
        pictures,
        arrivedWarehouse,
        packageWeight: packageWeight?.toString() ?? "",
        trackingNumber,
        sendEmail,
        status,
      });
    }
  }, [orders]);

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
              <DialogTitle>Update Order</DialogTitle>
              <DialogDescription>
                Manage information regarding this order(s)
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
                  {orders.length === 1 && (
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="pictures"
                        render={({}) => {
                          return (
                            <FormItem className="w-full space-y-0">
                              <FormLabel className="inline-block">
                                <span className="flex gap-1 items-center h-full">
                                  <span>Upload Pictures</span>
                                </span>
                              </FormLabel>
                              <div className="space-y-1">
                                <FormControl>
                                  <FileUploadButton
                                    error={!!errors.pictures}
                                    currentFiles={
                                      (form.watch(`pictures`) ?? [])?.map(
                                        (picture) => ({
                                          url: picture.url,
                                          fileName: picture.filename,
                                          key: picture.key,
                                        })
                                      ) as IFile[]
                                    }
                                    isMultiple
                                    setUploadedFiles={(files) => {
                                      form.setValue(
                                        `pictures`,
                                        files.map((file) => ({
                                          url: file.url,
                                          filename: file.fileName,
                                          key: file.key,
                                        }))
                                      );
                                      form.clearErrors(`pictures`);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                      {pictures.length > 0 && (
                        <div
                          className={cn("flex flex-wrap items-center gap-2")}
                        >
                          {pictures?.map((picture) => {
                            return (
                              <div
                                key={picture.key}
                                className={cn("flex gap-3 relative")}
                              >
                                <div className="relative w-[4rem] h-[4rem] rounded-md overflow-hidden border border-gray-200">
                                  <img
                                    src={picture.url}
                                    alt={picture.filename}
                                    className="w-full h-full object-center object-cover"
                                  />
                                  <span
                                    className="absolute top-0 right-0 bg-red-700 rounded-full h-4 w-4 flex items-center justify-center cursor-pointer"
                                    onClick={() => {
                                      const currentPictures =
                                        form.watch(`pictures`) || [];
                                      form.setValue(
                                        `pictures`,
                                        currentPictures.filter(
                                          (p) => p.key !== picture.key
                                        )
                                      );
                                    }}
                                  >
                                    <X className="h-3 w-3 text-white" />
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="arrivedWarehouse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="arrivedWarehouse">
                          Arrived Warehouse
                        </FormLabel>
                        <div className="flex flex-col space-y-1">
                          <FormControl>
                            <DatePicker
                              {...field}
                              onChange={(date) => {
                                field.onChange(date);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
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
                            <FormControl>
                              <Input
                                {...field}
                                id="trackingNumber"
                                className="bg-transparent"
                                placeholder="Tracking Number"
                                error={!!errors?.trackingNumber?.message}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                  <div>
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
                                    {Object.entries(OrderStatus).map(
                                      ([key, value]) => (
                                        <SelectItem key={key} value={value}>
                                          {orderStatusInfo[value]?.text}
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
                            <FormLabel
                              className="text-nowrap"
                              htmlFor="sendEmail"
                            >
                              Send Email
                            </FormLabel>
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
                        {Object.entries(orders[0].emailsSent).map(
                          ([key, value]) => {
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
                          }
                        )}
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
                    Update
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

export default OrderDialog;
