import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
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
import { OrderStatus } from "@/interfaces/order.interface";
import { categories, orderStatusInfo } from "@/lib/constants";
import { createOrderSchema } from "@/schemas/new-order.schema";
import { Plus, X } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";

interface ItemsProps {
  form: UseFormReturn<z.infer<typeof createOrderSchema>>;
}

const Items = ({ form }: ItemsProps) => {
  const { errors } = form.formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div>
      {fields.map((_, idx) => {
        return (
          <div className="my-4 border rounded-lg p-6 pt-5 relative" key={_.id}>
            <p className="mb-5 font-semibold">{_.name || `Item ${idx + 1}`}</p>
            <p className="font-semibold text-sm mt-3">Required Fields</p>
            <div className="flex flex-col gap-4 py-4">
              <FormField
                control={form.control}
                name={`items.${idx}.name`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor={`items.${idx}.name`}>Name</FormLabel>
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
                          isModal={false}
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
                          searchPlaceholder="Search category"
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
                                  <span className="text-gray-400">Status</span>
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(OrderStatus).map(
                                ([key, value]) => {
                                  return (
                                    <SelectItem key={key} value={value}>
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
            <p className="font-semibold text-sm mt-3">Optional Fields</p>
            <div className="flex flex-col gap-4 py-4">
              <FormField
                control={form.control}
                name={`items.${idx}.orderAmount`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor={`items.${idx}.orderAmount`}>
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
                            error={!!errors?.items?.[idx]?.orderAmount}
                            thousandSeparator=","
                            onValueChange={(values) => {
                              field.onChange(values.value ?? "");
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
                      <FormLabel htmlFor={`items.${idx}.packageWeight`}>
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
                            error={!!errors?.items?.[idx]?.packageWeight}
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
                      <FormLabel htmlFor={`items.${idx}.trackingNumber`}>
                        Tracking Number
                      </FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            {...field}
                            id="password"
                            placeholder="Tracking Number"
                            error={!!errors?.items?.[idx]?.trackingNumber}
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
  );
};

export default Items;
