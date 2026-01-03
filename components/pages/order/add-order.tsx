import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import DatePicker from "@/components/ui/date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatus } from "@/interfaces/order.interface";
import { categories, orderStatusInfo } from "@/lib/constants";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { addOrderItemSchema } from "@/schemas/new-order.schema";
import {
  useCreateOrderItemsMutation,
  useGetOrdersQuery,
} from "@/services/order.service";
import { useGetUsersQuery } from "@/services/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

const AddOrderDialog = () => {
  const [createOrderItems, { isLoading }] = useCreateOrderItemsMutation();
  const [open, setOpen] = useState<boolean>(false);
  const { data } = useGetUsersQuery(
    { noLimit: true, page: 0 },
    { skip: !open }
  );

  const users = data?.data.data || [];
  const usersToRender = useMemo(() => {
    return [...users]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name }) => ({
        value: id,
        label: name,
      }));
  }, [users]);
  const form = useForm<z.infer<typeof addOrderItemSchema>>({
    resolver: zodResolver(addOrderItemSchema),
    mode: "onTouched",
    defaultValues: {
      user: "",
      items: [
        {
          name: "",
          status: OrderStatus.DRAFT,
          quantity: "",
          packageWeight: "",
          items: [],
          dateOrdered: new Date(),
        },
      ],
    },
  });
  const { data: ordersData } = useGetOrdersQuery(
    {
      page: 0,
      userId: form.watch("user"),
      noLimit: true,
      notStatuses: [OrderStatus.DRAFT],
    },
    {
      skip: !form.watch("user"),
    }
  );
  const orders = ordersData?.data.data || [];
  const ordersToRender = useMemo(() => {
    return [...orders].map(({ id, orderNumber, status }) => ({
      value: id,
      label: orderNumber,
      status,
    }));
  }, [orders]);

  const onSubmit = async (values: z.infer<typeof addOrderItemSchema>) => {
    try {
      const response = await createOrderItems({
        user: values.user,
        orders: values.orders,
        items: values.items.map((item) => {
          return {
            category: item.category,
            items: item.items,
            name: item.name,
            note: item.note,
            orderAmount: item.orderAmount ? +item.orderAmount : undefined,
            packageWeight: item.packageWeight ? +item.packageWeight : undefined,
            quantity: +item.quantity,
            status: item.status,
            trackingNumber: item.trackingNumber,
            dateOrdered: item.dateOrdered,
          };
        }),
      }).unwrap();
      if (response.status === 200) {
        notify(response.message, "success");
        setOpen(false);
      }
    } catch (err) {
      notify("Order Item(s) could not be created", "error");
    }
  };

  const { errors } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        user: "",
        items: [
          {
            name: "",
            status: OrderStatus.DRAFT,
            quantity: "",
            packageWeight: "",
            items: [],
            dateOrdered: new Date(),
          },
        ],
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-11 border-zinc-300 hover:border-zinc-400 text-[1rem] shadow-none !bg-transparent"
          variant="outline"
        >
          Add Item(s)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0">
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Create Order Item(s)</DialogTitle>
              <DialogDescription>
                Create new order items for a user.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
                <div>
                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name={`user`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>User</FormLabel>
                          <div className="flex flex-col space-y-1">
                            <FormControl>
                              <Combobox
                                isModal={true}
                                items={usersToRender}
                                externalValue={field.value ?? ""}
                                lowercaseVal={false}
                                handleReceiveValue={(value) => {
                                  field.onChange(value);
                                }}
                                buttonProps={{
                                  ...field,
                                  className:
                                    "h-11 px-3 w-full justify-between !bg-transparent !pointer-events-auto",
                                }}
                                searchPlaceholder="Search Users"
                                error={!!errors.user}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    {form.watch("user") && (
                      <FormField
                        control={form.control}
                        name={`orders`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Order(s)</FormLabel>
                            <div className="flex flex-col space-y-1">
                              <FormControl>
                                <Combobox<{
                                  value: string;
                                  label: string;
                                  status: OrderStatus;
                                }>
                                  renderProp={({ item, value }) => {
                                    const isSelected = value
                                      ? (value as string[]).some(
                                          (v) =>
                                            v.toLowerCase() ===
                                            item.value.toLowerCase()
                                        )
                                      : false;
                                    const statusInfo =
                                      orderStatusInfo[item.status];
                                    return (
                                      <div className="flex gap-2 items-center justify-between w-full">
                                        <span>
                                          {item.label}{" "}
                                          {statusInfo?.text && (
                                            <Badge
                                              style={{
                                                backgroundColor:
                                                  statusInfo?.bgColor,
                                                color:
                                                  statusInfo?.color ?? "#fff",
                                              }}
                                            >
                                              {statusInfo?.text}
                                            </Badge>
                                          )}
                                        </span>
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </div>
                                    );
                                  }}
                                  isModal={true}
                                  multiple
                                  items={ordersToRender}
                                  externalValue={field.value ?? ""}
                                  lowercaseVal={false}
                                  handleReceiveValue={(value) => {
                                    field.onChange(value);
                                  }}
                                  buttonProps={{
                                    ...field,
                                    className:
                                      "h-11 px-3 w-full justify-between !bg-transparent !pointer-events-auto",
                                  }}
                                  searchPlaceholder="Search Order(s)"
                                  error={!!errors.orders}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  {fields.map((_, idx) => {
                    return (
                      <div
                        className="my-4 border rounded-lg p-6 pt-5 relative"
                        key={_.id}
                      >
                        <p className="mb-5 font-semibold">
                          {_.name || `Item ${idx + 1}`}
                        </p>
                        <p className="font-semibold text-sm mt-3">
                          Required Fields
                        </p>
                        <div className="flex flex-col gap-4 py-4">
                          <FormField
                            control={form.control}
                            name={`items.${idx}.name`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel htmlFor={`items.${idx}.name`}>
                                    Name
                                  </FormLabel>
                                  <div className="flex flex-col space-y-1">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Name"
                                        id={`items.${idx}.name`}
                                        error={!!errors?.items?.[idx]?.name}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${idx}.category`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Category</FormLabel>
                                <div className="flex flex-col space-y-1">
                                  <FormControl>
                                    <Combobox
                                      isModal={true}
                                      items={categories}
                                      externalValue={field.value ?? ""}
                                      lowercaseVal={false}
                                      handleReceiveValue={(value) => {
                                        field.onChange(value);
                                      }}
                                      buttonProps={{
                                        ...field,
                                        className:
                                          "h-11 px-3 w-full justify-between !bg-transparent !pointer-events-auto",
                                      }}
                                      searchPlaceholder="Search Category"
                                      error={!!errors.items?.[idx]?.category}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${idx}.status`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel htmlFor={`items.${idx}.status`}>
                                    Status
                                  </FormLabel>
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
                                                Status
                                              </span>
                                            }
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.entries(OrderStatus).map(
                                            ([key, value]) => {
                                              return (
                                                <SelectItem
                                                  key={key}
                                                  value={value}
                                                >
                                                  {orderStatusInfo[key]?.text}
                                                </SelectItem>
                                              );
                                            }
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
                            name={`items.${idx}.quantity`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel htmlFor={`items.${idx}.quantity`}>
                                    Quantity
                                  </FormLabel>
                                  <div className="flex flex-col space-y-1">
                                    <FormControl>
                                      <NumericFormat
                                        type="text"
                                        {...field}
                                        name={`items.${idx}.quantity`}
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        placeholder="Quantity"
                                        displayType="input"
                                        decimalSeparator="."
                                        allowNegative={false}
                                        error={!!errors?.items?.[idx]?.quantity}
                                        thousandSeparator=","
                                        onValueChange={(values) => {
                                          if (!values.floatValue) return;
                                          form.setValue(
                                            `items.${idx}.quantity`,
                                            values.value
                                          );
                                        }}
                                        className="h-11 w-full"
                                        customInput={Input}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                        <p className="font-semibold text-sm mt-3">
                          Optional Fields
                        </p>
                        <div className="flex flex-col gap-4 py-4">
                          <FormField
                            control={form.control}
                            name={`items.${idx}.dateOrdered`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel
                                    htmlFor={`items.${idx}.dateOrdered`}
                                  >
                                    Date Ordered
                                  </FormLabel>
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center gap-3">
                                      <FormControl>
                                        <DatePicker
                                          {...field}
                                          enableTime
                                          value={
                                            field.value
                                              ? new Date(field.value)
                                              : undefined
                                          }
                                          onChange={field.onChange}
                                          buttonClassName="flex-1"
                                          placeholder="Date Ordered"
                                          error={
                                            !!errors?.items?.[idx]?.dateOrdered
                                              ?.message
                                          }
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
                            name={`items.${idx}.orderAmount`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel
                                    htmlFor={`items.${idx}.orderAmount`}
                                  >
                                    Order Amount
                                  </FormLabel>
                                  <div className="flex flex-col space-y-1">
                                    <FormControl>
                                      <NumericFormat
                                        type="text"
                                        {...field}
                                        name={`items.${idx}.orderAmount`}
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        placeholder="Order Amount"
                                        displayType="input"
                                        prefix="₦"
                                        decimalSeparator="."
                                        allowNegative={false}
                                        error={
                                          !!errors?.items?.[idx]?.orderAmount
                                        }
                                        thousandSeparator=","
                                        onValueChange={(values) => {
                                          if (!values.floatValue) return;
                                          form.setValue(
                                            `items.${idx}.orderAmount`,
                                            values.value
                                          );
                                        }}
                                        className="h-11 w-full"
                                        customInput={Input}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${idx}.packageWeight`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel
                                    htmlFor={`items.${idx}.packageWeight`}
                                  >
                                    Package Weight
                                  </FormLabel>
                                  <div className="flex flex-col space-y-1">
                                    <FormControl>
                                      <NumericFormat
                                        type="text"
                                        {...field}
                                        name={`items.${idx}.packageWeight`}
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        placeholder="Package Weight"
                                        displayType="input"
                                        suffix="KG"
                                        decimalSeparator="."
                                        allowNegative={false}
                                        error={
                                          !!errors?.items?.[idx]?.packageWeight
                                        }
                                        thousandSeparator=","
                                        onValueChange={(values) => {
                                          if (!values.floatValue) return;
                                          form.setValue(
                                            `items.${idx}.packageWeight`,
                                            values.value
                                          );
                                        }}
                                        className="h-11 w-full"
                                        customInput={Input}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${idx}.trackingNumber`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel
                                    htmlFor={`items.${idx}.trackingNumber`}
                                  >
                                    Tracking Number
                                  </FormLabel>
                                  <div className="flex flex-col space-y-1">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        id="password"
                                        placeholder="Tracking Number"
                                        error={
                                          !!errors?.items?.[idx]?.trackingNumber
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${idx}.note`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel htmlFor="name">Note</FormLabel>
                                  <div className="flex flex-col space-y-1">
                                    <FormControl>
                                      <Textarea
                                        {...field}
                                        id={`items.${idx}.note`}
                                        rows={5}
                                        className="!bg-transparent hover:border-zinc-400 placeholder:text-gray-400 shadow-none"
                                        placeholder="e.g Additional notes about this order"
                                        error={!!errors?.items?.[idx]?.note}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                          {fields.length > 1 && (
                            <div
                              className="absolute right-3 top-3 bg-destructive rounded-full flex items-center justify-center text-white h-6 w-6 cursor-pointer"
                              onClick={() => remove(idx)}
                            >
                              <X className="size-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    className="h-11 shadow-none w-full mt-2"
                    onClick={() => {
                      append({
                        name: "",
                        status: OrderStatus.DRAFT,
                        quantity: "",
                        packageWeight: "",
                        items: [],
                      });
                    }}
                  >
                    <Plus />
                    Add Item
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 font-semibold px-6 shadow-none mt-[3rem]"
                  >
                    {isLoading && (
                      <Icons.spinner className="h-3 w-3 animate-spin" />
                    )}
                    Save Order
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderDialog;
