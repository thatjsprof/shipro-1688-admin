import { UseFormReturn } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { productSchema } from "@/schemas/product";
import z from "zod";
import { NumericFormat } from "react-number-format";
import useRate from "@/hooks/use-rate";
import { useEffect } from "react";

interface BasicProps {
  form: UseFormReturn<z.infer<typeof productSchema>>;
}

export const Basic = ({ form }: BasicProps) => {
  const { cnyRates } = useRate();

  const {
    control,
    watch,
    formState: { errors },
  } = form;

  useEffect(() => {
    form.setValue(
      "deliveryFeeNaira",
      (+watch("deliveryFeeYen") * cnyRates).toString()
    );
  }, [watch("deliveryFeeYen"), cnyRates]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Product Information
      </h3>
      <div className="space-y-4">
        <FormField
          control={control}
          name="description"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="name">Description</FormLabel>
                <div className="flex flex-col space-y-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      id={"description"}
                      rows={5}
                      className="!bg-transparent hover:border-zinc-400 placeholder:text-gray-400 shadow-none"
                      placeholder="Description of this product"
                      error={!!errors?.description?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            );
          }}
        />
        <div className="grid sm:grid-cols-12 gap-3">
          <div className="col-span-4">
            <FormField
              control={control}
              name="stock"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="name">Stock</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <NumericFormat
                          type="text"
                          {...field}
                          name="stock"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="Stock"
                          displayType="input"
                          decimalSeparator="."
                          allowNegative={false}
                          thousandSeparator=","
                          error={!!errors.stock?.message}
                          onValueChange={(values) => {
                            if (!values.floatValue) return;
                            form.setValue("stock", values.value);
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
          <div className="col-span-4">
            <FormField
              control={control}
              name="moq"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="name">MOQ</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <NumericFormat
                          type="text"
                          {...field}
                          name="moq"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="MOQ"
                          displayType="input"
                          decimalSeparator="."
                          allowNegative={false}
                          error={!!errors.moq?.message}
                          thousandSeparator=","
                          onValueChange={(values) => {
                            if (!values.floatValue) return;
                            form.setValue("moq", values.value);
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
          <div className="col-span-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="location">Location</FormLabel>
                    <div className="flex flex-col space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          placeholder="Location"
                          error={!!errors?.location}
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
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={control}
            name="moq"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel htmlFor="name">MOQ</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <NumericFormat
                        type="text"
                        {...field}
                        name="moq"
                        autoCapitalize="none"
                        autoCorrect="off"
                        placeholder="MOQ"
                        displayType="input"
                        decimalSeparator="."
                        allowNegative={false}
                        error={!!errors.moq?.message}
                        thousandSeparator=","
                        onValueChange={(values) => {
                          if (!values.floatValue) return;
                          form.setValue("moq", values.value);
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
            control={control}
            name="deliveryFeeYen"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel htmlFor="name">Delivery Fee (¥)</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <NumericFormat
                        type="text"
                        {...field}
                        name="deliveryFeeYen"
                        autoCapitalize="none"
                        autoCorrect="off"
                        placeholder="Delivery Fee"
                        displayType="input"
                        decimalSeparator="."
                        allowNegative={false}
                        thousandSeparator=","
                        error={!!errors.stock?.message}
                        onValueChange={(values) => {
                          if (!values.floatValue) return;
                          form.setValue("deliveryFeeYen", values.value);
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
            control={control}
            name="deliveryFeeNaira"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel htmlFor="name">Delivery Fee (₦)</FormLabel>
                  <div className="flex flex-col space-y-1">
                    <FormControl>
                      <NumericFormat
                        type="text"
                        {...field}
                        name="deliveryFeeNaira"
                        autoCapitalize="none"
                        autoCorrect="off"
                        placeholder="Delivery Fee"
                        displayType="input"
                        disabled
                        decimalSeparator="."
                        allowNegative={false}
                        thousandSeparator=","
                        error={!!errors.stock?.message}
                        onValueChange={(values) => {
                          if (!values.floatValue) return;
                          form.setValue("deliveryFeeNaira", values.value);
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
      </div>
    </div>
  );
};
