import { Combobox } from "@/components/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PhoneNumberInput from "@/components/ui/phone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  OrderOrigin,
  OrderStatus,
  OrderType,
} from "@/interfaces/order.interface";
import { orderStatusInfo, originNames, typeNames } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { createOrderSchema } from "@/schemas/new-order.schema";
import { useGetUsersQuery } from "@/services/user.service";
import { useAppSelector } from "@/store/hooks";
import { UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

interface DetailsProps {
  form: UseFormReturn<z.infer<typeof createOrderSchema>>;
}

const Details = ({ form }: DetailsProps) => {
  const { errors } = form.formState;
  const authenticated = useAppSelector((state) => state.user.authenticated);
  const { data } = useGetUsersQuery(
    { noLimit: true, page: 0 },
    { skip: !authenticated }
  );
  const users = data?.data.data || [];
  console.log({ users });

  return (
    <div>
      <p className="font-semibold text-sm mt-3">User Info</p>
      <div className="flex flex-col gap-4 py-4">
        <FormField
          control={form.control}
          name="order.userId"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="order.userId">User</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <Combobox
                      isModal={false}
                      items={users.map((user) => {
                        const value = user.id;
                        const label = user.name;
                        return {
                          label,
                          value,
                        };
                      })}
                      contentCls="PopoverContent"
                      externalValue={form.watch("order.userId")!}
                      handleReceiveValue={(val) => {
                        form.setValue("order.userId", val);
                        form.setError("order.userId", {
                          message: "",
                        });
                      }}
                      emptyPlaceholder="User not found"
                      className="z-[9999]"
                      error={!!errors.order?.userId?.message}
                      buttonProps={{
                        ...field,
                        className: cn(
                          "h-11 px-3 w-full justify-between !bg-transparent",
                          !!errors.order?.userId?.message &&
                            "border-destructive"
                        ),
                      }}
                      searchPlaceholder="Select User"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            );
          }}
        />
      </div>
      <p className="font-semibold text-sm mt-3">Required Fields</p>
      <div className="flex flex-col gap-4 py-4">
        <FormField
          control={form.control}
          name="order.type"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="order.type">Type</FormLabel>
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
                            <span className="text-gray-400">Type</span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OrderType).map(([key, value]) => {
                          return (
                            <SelectItem key={key} value={value}>
                              {typeNames[key]}
                            </SelectItem>
                          );
                        })}
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
          name="order.origin"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="order.origin">Origin</FormLabel>
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
                            <span className="text-gray-400">Origin</span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OrderOrigin).map(([key, value]) => {
                          return (
                            <SelectItem key={key} value={value}>
                              {originNames[key]}
                            </SelectItem>
                          );
                        })}
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
          name="order.status"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="order.status">Status</FormLabel>
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
                            <span className="text-gray-400">Status</span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OrderStatus).map(([key, value]) => {
                          return (
                            <SelectItem key={key} value={value}>
                              {orderStatusInfo[key]?.text}
                            </SelectItem>
                          );
                        })}
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
      <p className="font-semibold text-sm mt-3">Optional Fields</p>
      <div className="flex flex-col gap-4 py-4">
        <FormField
          control={form.control}
          name="order.trackingNumber"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="order.trackingNumber">
                  Tracking Number
                </FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <Input
                      {...field}
                      id="password"
                      placeholder="Tracking Number"
                      error={!!errors?.order?.trackingNumber}
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
          name="order.phoneNumber"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="order.phoneNumber">Phone Number</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <PhoneNumberInput
                      {...field}
                      value={field.value || ""}
                      id="order.phoneNumber"
                      country="NG"
                      className="bg-transparent"
                      placeholder="Enter your phone number"
                      error={!!errors?.order?.phoneNumber}
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
          name="order.subTotal"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="name">Sub Total</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <NumericFormat
                      type="text"
                      {...field}
                      name="order.subTotal"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="Sub Total"
                      displayType="input"
                      prefix="₦"
                      decimalSeparator="."
                      allowNegative={false}
                      error={!!errors.order?.subTotal?.message}
                      thousandSeparator=","
                      onValueChange={(values) => {
                        if (!values.floatValue) return;
                        form.setValue("order.subTotal", values.value);
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
          name="order.orderAmount"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="name">Order Amount</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <NumericFormat
                      type="text"
                      {...field}
                      name="order.orderAmount"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="Order Amount"
                      displayType="input"
                      prefix="₦"
                      decimalSeparator="."
                      allowNegative={false}
                      error={!!errors.order?.orderAmount?.message}
                      thousandSeparator=","
                      onValueChange={(values) => {
                        if (!values.floatValue) return;
                        form.setValue("order.orderAmount", values.value);
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
          name="order.serviceCharge"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="name">Service Charge</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <NumericFormat
                      type="text"
                      {...field}
                      name="order.serviceCharge"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="Service Charge"
                      displayType="input"
                      prefix="₦"
                      decimalSeparator="."
                      allowNegative={false}
                      error={!!errors.order?.serviceCharge?.message}
                      thousandSeparator=","
                      onValueChange={(values) => {
                        if (!values.floatValue) return;
                        form.setValue("order.serviceCharge", values.value);
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
          name="order.totalWeight"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="name">Total Weight</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <NumericFormat
                      type="text"
                      {...field}
                      name="order.totalWeight"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="Total Weight"
                      displayType="input"
                      suffix="KG"
                      decimalSeparator="."
                      allowNegative={false}
                      error={!!errors.order?.totalWeight?.message}
                      thousandSeparator=","
                      onValueChange={(values) => {
                        if (!values.floatValue) return;
                        form.setValue("order.totalWeight", values.value);
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
          name="order.packageWeight"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="name">Package Weight</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <NumericFormat
                      type="text"
                      {...field}
                      name="order.packageWeight"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="Package Weight"
                      displayType="input"
                      suffix="KG"
                      decimalSeparator="."
                      allowNegative={false}
                      error={!!errors.order?.packageWeight?.message}
                      thousandSeparator=","
                      onValueChange={(values) => {
                        if (!values.floatValue) return;
                        form.setValue("order.packageWeight", values.value);
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
          name="order.note"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="name">Note</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      id="order.note"
                      rows={5}
                      className="!bg-transparent hover:border-zinc-400 placeholder:text-gray-400 shadow-none"
                      placeholder="e.g Additional notes about this order"
                      error={!!errors?.order?.note}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Details;
