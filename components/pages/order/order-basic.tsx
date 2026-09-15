import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import DatePicker from "@/components/ui/date";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  IOrder,
  IOrderItem,
  OrderStatus,
  PackageWeightUnit,
} from "@/interfaces/order.interface";
import {
  categories,
  orderStatusInfo,
  getStatusEmailDefaultNote,
  nextStatusEmailNote,
} from "@/lib/constants";
import { stripRichHtml } from "@/lib/rich-text";
import { notify } from "@/lib/toast";
import { orderStatusOnlySchema } from "@/schemas/order";
import {
  useCreateOrderItemsMutation,
  useUpdateItemsMutation,
  useUpdateOrderMutation,
} from "@/services/order.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

interface IOrderBasic {
  order: IOrder | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

type EditableOrderItem = {
  key: string;
  id?: string;
  name: string;
  quantity: string;
  category?: string;
  status?: OrderStatus;
  dateOrdered?: Date;
  orderAmount?: string;
  packageWeight?: string;
  packageWeightUnit?: PackageWeightUnit;
  trackingNumber?: string;
  note?: string;
  originalName?: string;
  originalQuantity?: number;
};

const itemDisplayName = (item: IOrderItem) =>
  item.name?.trim() || stripRichHtml(item.product?.description) || "";

const emptyNewItem = (order?: IOrder | null): EditableOrderItem => ({
  key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  quantity: "",
  category: "",
  status: order?.status || OrderStatus.DRAFT,
  dateOrdered: new Date(),
  orderAmount: "",
  packageWeight: "",
  packageWeightUnit: PackageWeightUnit.KG,
  trackingNumber: "",
  note: "",
});

const toEditableItems = (order: IOrder | null): EditableOrderItem[] => {
  if (!order) return [];
  return (order.items ?? []).map((item) => {
    const name = itemDisplayName(item);
    return {
      key: item.id,
      id: item.id,
      name,
      quantity: String(item.quantity ?? 1),
      originalName: name,
      originalQuantity: item.quantity ?? 1,
    };
  });
};

const OrderBasic = ({ order, setOpen }: IOrderBasic) => {
  const [updateOrder, { isLoading: updatingOrder }] = useUpdateOrderMutation();
  const [updateItems, { isLoading: updatingItems }] = useUpdateItemsMutation();
  const [createOrderItems, { isLoading: creatingItems }] =
    useCreateOrderItemsMutation();
  const [items, setItems] = useState<EditableOrderItem[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const isLoading = updatingOrder || updatingItems || creatingItems;

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
  const canSendEmail =
    !!watch("status") && itemsStatus !== "none" && !!itemsStatus;

  const patchItem = (key: string, patch: Partial<EditableOrderItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
    setItemsError(null);
  };

  const addItem = () => {
    setItems((prev) => [...prev, emptyNewItem(order)]);
    setItemsError(null);
  };

  const removeNewItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
    setItemsError(null);
  };

  const validateItems = () => {
    for (const item of items) {
      if (!item.name.trim()) {
        setItemsError("Each order item needs a name");
        return false;
      }
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        setItemsError("Quantity must be a positive number");
        return false;
      }
      if (!item.id && !item.status) {
        setItemsError("Each new order item needs a status");
        return false;
      }
    }
    setItemsError(null);
    return true;
  };

  const handleSubmit = async (
    values: z.infer<typeof orderStatusOnlySchema>
  ) => {
    if (!order?.id) return;
    if (!validateItems()) return;

    try {
      const itemsStatusValue =
        values.itemsStatus && values.itemsStatus !== "none"
          ? (values.itemsStatus as OrderStatus)
          : undefined;

      const response = await updateOrder({
        id: order.id,
        data: {
          status: values.status as OrderStatus,
          ...(itemsStatusValue ? { itemsStatus: itemsStatusValue } : {}),
          sendEmail: !!values.sendEmail,
          emailNote: values.sendEmail
            ? values.emailNote?.trim() || undefined
            : undefined,
        },
      }).unwrap();

      const changedExisting = items.filter(
        (item) =>
          item.id &&
          (item.name.trim() !== (item.originalName ?? "").trim() ||
            Number(item.quantity) !== Number(item.originalQuantity ?? 0))
      );

      for (const item of changedExisting) {
        await updateItems({
          items: [item.id!],
          data: {
            name: item.name.trim(),
            quantity: Number(item.quantity),
          },
        }).unwrap();
      }

      const newItems = items.filter((item) => !item.id);
      if (newItems.length > 0) {
        if (!order.user?.id) {
          notify("Order has no user; cannot create items", "error");
          return;
        }
        await createOrderItems({
          user: order.user.id,
          orders: [order.id],
          items: newItems.map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity),
            status: item.status || order.status || OrderStatus.DRAFT,
            category: item.category || undefined,
            note: item.note || undefined,
            trackingNumber: item.trackingNumber || undefined,
            orderAmount: item.orderAmount ? +item.orderAmount : undefined,
            packageWeight: item.packageWeight
              ? +item.packageWeight
              : undefined,
            packageWeightUnit: item.packageWeightUnit,
            dateOrdered: item.dateOrdered,
          })),
        }).unwrap();
      }

      if (response.status === 200) {
        notify(response.message, "success");
        setOpen(false);
      } else {
        notify(response.message, "error");
      }
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
    setItems(toEditableItems(order));
    setItemsError(null);
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
                      const previousStatus = form.getValues("itemsStatus");
                      field.onChange(value);
                      if (value === "none") {
                        form.setValue("sendEmail", false);
                        form.setValue("emailNote", "");
                        return;
                      }
                      if (form.getValues("sendEmail")) {
                        form.setValue(
                          "emailNote",
                          nextStatusEmailNote({
                            previousStatus,
                            nextStatus: value,
                            currentNote: form.getValues("emailNote"),
                          })
                        );
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
                        return;
                      }
                      const note = form.getValues("emailNote")?.trim() ?? "";
                      if (!note) {
                        form.setValue(
                          "emailNote",
                          getStatusEmailDefaultNote(
                            form.getValues("itemsStatus")
                          )
                        );
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

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Order items</p>
                <p className="text-xs text-zinc-500">
                  Edit existing name/quantity, or add a full new item
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none"
                onClick={addItem}
              >
                <Plus className="mr-1 size-4" /> Add item
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-zinc-500">No items on this order yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item, index) =>
                  item.id ? (
                    <div
                      key={item.key}
                      className="space-y-3 rounded-lg border border-zinc-200 p-3"
                    >
                      <p className="text-xs font-medium text-zinc-500">
                        Item {index + 1}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              patchItem(item.key, { name: e.target.value })
                            }
                            placeholder="Item name"
                            className="h-10 bg-transparent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Quantity</label>
                          <NumericFormat
                            type="text"
                            allowNegative={false}
                            decimalScale={0}
                            value={item.quantity}
                            onValueChange={(values) =>
                              patchItem(item.key, {
                                quantity: values.value ?? "",
                              })
                            }
                            customInput={Input}
                            className="h-10 bg-transparent"
                            placeholder="Qty"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={item.key}
                      className="relative space-y-4 rounded-lg border border-zinc-200 p-4 pt-5"
                    >
                      <div className="flex items-center justify-between gap-2 pr-8">
                        <p className="text-sm font-semibold">
                          {item.name || `New item ${index + 1}`}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 size-8 text-destructive hover:text-destructive"
                          onClick={() => removeNewItem(item.key)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      <p className="text-sm font-semibold">Required Fields</p>
                      <div className="flex flex-col gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              patchItem(item.key, { name: e.target.value })
                            }
                            placeholder="Name"
                            className="h-11 bg-transparent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Category</label>
                          <Combobox
                            isModal={true}
                            items={categories}
                            externalValue={item.category ?? ""}
                            lowercaseVal={false}
                            handleReceiveValue={(value) =>
                              patchItem(item.key, {
                                category: String(value ?? ""),
                              })
                            }
                            buttonProps={{
                              className:
                                "h-11 px-3 w-full justify-between !bg-transparent !pointer-events-auto",
                            }}
                            searchPlaceholder="Search Category"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Status</label>
                          <Select
                            value={item.status}
                            onValueChange={(value) => {
                              if (!value) return;
                              patchItem(item.key, {
                                status: value as OrderStatus,
                              });
                            }}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue
                                placeholder={
                                  <span className="text-gray-400">Status</span>
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
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Quantity</label>
                          <NumericFormat
                            type="text"
                            allowNegative={false}
                            decimalSeparator="."
                            thousandSeparator=","
                            value={item.quantity}
                            onValueChange={(values) => {
                              if (!values.floatValue) {
                                patchItem(item.key, { quantity: "" });
                                return;
                              }
                              patchItem(item.key, {
                                quantity: values.value ?? "",
                              });
                            }}
                            customInput={Input}
                            className="h-11 w-full bg-transparent"
                            placeholder="Quantity"
                          />
                        </div>
                      </div>

                      <p className="text-sm font-semibold">Optional Fields</p>
                      <div className="flex flex-col gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Date Ordered
                          </label>
                          <DatePicker
                            enableTime
                            value={item.dateOrdered}
                            onChange={(date) =>
                              patchItem(item.key, {
                                dateOrdered: date || undefined,
                              })
                            }
                            buttonClassName="w-full"
                            placeholder="Date Ordered"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Order Amount
                          </label>
                          <NumericFormat
                            type="text"
                            prefix="₦"
                            allowNegative={false}
                            decimalSeparator="."
                            thousandSeparator=","
                            value={item.orderAmount ?? ""}
                            onValueChange={(values) =>
                              patchItem(item.key, {
                                orderAmount: values.value ?? "",
                              })
                            }
                            customInput={Input}
                            className="h-11 w-full bg-transparent"
                            placeholder="Order Amount"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Package Weight
                          </label>
                          <NumericFormat
                            type="text"
                            allowNegative={false}
                            decimalSeparator="."
                            thousandSeparator=","
                            value={item.packageWeight ?? ""}
                            onValueChange={(values) =>
                              patchItem(item.key, {
                                packageWeight: values.value ?? "",
                              })
                            }
                            customInput={Input}
                            className="h-11 w-full bg-transparent pr-[6rem]"
                            endClassname="top-0 right-1 h-full translate-x-0 translate-y-0 flex items-center"
                            placeholder="Package Weight"
                            EndIcon={
                              <Select
                                value={
                                  item.packageWeightUnit ?? PackageWeightUnit.KG
                                }
                                onValueChange={(value) => {
                                  if (!value) return;
                                  patchItem(item.key, {
                                    packageWeightUnit:
                                      value as PackageWeightUnit,
                                  });
                                }}
                              >
                                <SelectTrigger className="h-9 w-18 border-none bg-transparent px-2 shadow-none rounded-l-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={PackageWeightUnit.KG}>
                                    KG
                                  </SelectItem>
                                  <SelectItem value={PackageWeightUnit.CBM}>
                                    CBM
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Tracking Number
                          </label>
                          <Input
                            value={item.trackingNumber ?? ""}
                            onChange={(e) =>
                              patchItem(item.key, {
                                trackingNumber: e.target.value,
                              })
                            }
                            placeholder="Tracking Number"
                            className="h-11 bg-transparent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Note</label>
                          <Textarea
                            value={item.note ?? ""}
                            onChange={(e) =>
                              patchItem(item.key, { note: e.target.value })
                            }
                            rows={5}
                            className="!bg-transparent shadow-none placeholder:text-gray-400 hover:border-zinc-400"
                            placeholder="e.g Additional notes about this order"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
            {itemsError && (
              <p className="text-sm text-destructive">{itemsError}</p>
            )}
          </div>
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
