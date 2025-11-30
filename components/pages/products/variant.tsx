import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { productSchema } from "@/schemas/product";
import { Plus, Trash2, X } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import z from "zod";
import { useEffect, useRef, useState } from "react";

interface IVariantProps {
  form: UseFormReturn<z.infer<typeof productSchema>>;
}

const Variant = ({ form }: IVariantProps) => {
  const { getValues, setValue, control, watch, formState } = form;
  const name = "variantProperties";
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const variantPropertiesRef = useRef<string>("");
  const [allCombinations, setAllCombinations] = useState<
    Array<Array<{ id: string; value: string }>>
  >([]);

  const {
    fields: propertyFields,
    append: appendProperty,
    remove: removeProperty,
  } = useFieldArray({
    control,
    name,
  });

  const generateId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addProperty = () => {
    appendProperty({
      name: "",
      values: [{ id: generateId(), value: "" }],
    });
  };

  const addPropertyValue = (propIndex: number) => {
    const currentProperties = getValues(name);
    const updatedValues = [
      ...currentProperties[propIndex].values,
      { id: generateId(), value: "" },
    ];
    setValue(`${name}.${propIndex}.values`, updatedValues);
  };

  const removePropertyValue = (propIndex: number, valueIndex: number) => {
    const currentProperties = getValues(name);
    const updatedValues = currentProperties[propIndex].values.filter(
      (_, index) => index !== valueIndex
    );
    setValue(`${name}.${propIndex}.values`, updatedValues);
  };

  const getSKUKey = (
    combination: Array<{ id: string; value: string }>
  ): string => {
    return combination.map((item) => item.id).join("_");
  };

  const generateAllCombinations = (variantProperties: any[]) => {
    if (variantProperties.length === 0) return [];
    const combinations: Array<Array<{ id: string; value: string }>> = [];

    const generate = (
      current: Array<{ id: string; value: string }>,
      depth: number
    ) => {
      if (depth === variantProperties.length) {
        combinations.push([...current]);
        return;
      }

      const prop = variantProperties[depth];
      for (const valueObj of prop.values) {
        if (valueObj.value.trim()) {
          current.push(valueObj);
          generate(current, depth + 1);
          current.pop();
        }
      }
    };

    generate([], 0);
    return combinations;
  };

  useEffect(() => {
    const subscription = watch((value, { name: fieldName }) => {
      if (fieldName?.startsWith(name)) {
        const currentProps = JSON.stringify(value.variantProperties || []);

        if (currentProps !== variantPropertiesRef.current) {
          variantPropertiesRef.current = currentProps;

          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            const combinations = generateAllCombinations(
              value.variantProperties || []
            );
            setAllCombinations(combinations);
            const currentSkus = getValues("skus") || {};
            const newSkus: Record<
              string,
              {
                price: string;
                stock: string;
              }
            > = {};

            console.log(combinations);

            combinations.forEach((combination) => {
              const skuKey = getSKUKey(combination);
              console.log(skuKey, currentSkus[skuKey]);
              if (currentSkus[skuKey]) {
                newSkus[skuKey] = currentSkus[skuKey];
              } else {
                newSkus[skuKey] = {
                  price: "",
                  stock: "",
                };
              }
            });

            setValue("skus", newSkus, {
              shouldValidate: false,
            });
          }, 500);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watch, getValues, setValue]);

  useEffect(() => {
    const variantProperties = getValues(name) || [];
    const combinations = generateAllCombinations(variantProperties);
    setAllCombinations(combinations);
  }, []);

  const variantProperties = watch(name);

  return (
    <div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Variant Properties
          </h3>
          <Button
            type="button"
            variant="ghost"
            onClick={addProperty}
            className="flex items-center gap-2 text-sm !text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Property
          </Button>
        </div>
        {formState.errors.variantProperties && (
          <p className="text-sm text-red-600 mb-2">
            {formState.errors.variantProperties.message}
          </p>
        )}
        <div className="space-y-8">
          {propertyFields.map((property, propIndex) => (
            <div
              key={property.id}
              className="border border-gray-200 rounded-lg p-6"
            >
              <FormField
                control={control}
                name={`variantProperties.${propIndex}.name`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Property name (e.g color, size)"
                            error={
                              !!formState.errors.variantProperties?.[propIndex]
                                ?.name
                            }
                            className="flex-1"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeProperty(propIndex)}
                          className={cn(
                            "p-2 !text-red-600 hover:bg-red-50 rounded-lg cursor-pointer",
                            propertyFields.length === 1 && "cursor-not-allowed"
                          )}
                          disabled={propertyFields.length === 1}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase my-3 mt-6 inline-block">
                  Values
                </label>
                <div className="flex flex-col gap-3">
                  {watch(`variantProperties.${propIndex}.values`).map(
                    (valueObj, valueIndex) => (
                      <FormField
                        key={valueObj.id}
                        control={control}
                        name={`variantProperties.${propIndex}.values.${valueIndex}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Value"
                                    error={
                                      !!formState.errors.variantProperties?.[
                                        propIndex
                                      ]?.values?.[valueIndex]
                                    }
                                    className="flex-1"
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  onClick={() =>
                                    removePropertyValue(propIndex, valueIndex)
                                  }
                                  variant="ghost"
                                  className={cn(
                                    "p-2 !text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer",
                                    watch(
                                      `variantProperties.${propIndex}.values`
                                    ).length === 1 && "cursor-not-allowed"
                                  )}
                                  disabled={
                                    watch(
                                      `variantProperties.${propIndex}.values`
                                    ).length === 1
                                  }
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => addPropertyValue(propIndex)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2 cursor-pointer"
                >
                  <Plus size={14} />
                  Add value
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          SKU Pricing & Stock ({allCombinations.length} possible combinations)
        </h3>
        {formState.errors.skus?.message && (
          <p className="text-sm text-red-600 mb-2">
            {formState.errors.skus.message.message}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {variantProperties.map((prop, idx) => (
                  <th
                    key={idx}
                    className="text-left py-3 px-4 text-sm font-medium text-gray-700 capitalize"
                  >
                    {prop.name}
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-32">
                  Price (¥)
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-32">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {allCombinations.map((combination, idx) => {
                const skuKey = getSKUKey(combination);

                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {combination.map((valueObj, vIdx) => (
                      <td key={vIdx} className="py-3 px-4 w-fit">
                        <span className="text-sm text-gray-900">
                          {valueObj.value}
                        </span>
                      </td>
                    ))}
                    <td className="py-3 px-4 align-top">
                      <FormField
                        control={control}
                        name={`skus.${skuKey}.price`}
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-col justify-start">
                              <div className="space-y-1">
                                <FormControl>
                                  <NumericFormat
                                    type="text"
                                    name={`skus.${skuKey}.price`}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    placeholder="Price"
                                    prefix="¥"
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
                                    className="h-10 w-48"
                                    customInput={Input}
                                    error={
                                      !!formState.errors.skus?.[skuKey]?.price
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 align-top">
                      <FormField
                        control={control}
                        name={`skus.${skuKey}.stock`}
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-col justify-start">
                              <div className="space-y-1">
                                <FormControl>
                                  <NumericFormat
                                    type="text"
                                    name={`skus.${skuKey}.stock`}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    placeholder="Stock"
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
                                    className="h-10 w-48"
                                    customInput={Input}
                                    error={
                                      !!formState.errors.skus?.[skuKey]?.stock
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Variant;
