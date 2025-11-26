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
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import z from "zod";

interface IAttributesProps {
  form: UseFormReturn<z.infer<typeof productSchema>>;
}

const Attributes = ({ form }: IAttributesProps) => {
  const { control, formState } = form;

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  const addAttribute = () => {
    appendAttribute({
      key: "",
      value: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
        <Button
          type="button"
          variant="ghost"
          onClick={addAttribute}
          className="flex items-center gap-2 text-sm !text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} />
          Add Attribute
        </Button>
      </div>
      {formState.errors.attributes && (
        <p className="text-sm text-red-600 mb-2">
          {formState.errors.attributes.message}
        </p>
      )}
      <div className="space-y-3">
        {attributeFields.map((attribute, idx) => (
          <div key={attribute.id} className="flex gap-3 items-start">
            <FormField
              control={control}
              name={`attributes.${idx}.key`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="space-y-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Key"
                        error={!!formState.errors.attributes?.[idx]?.key}
                        className="px-4 py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`attributes.${idx}.value`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="space-y-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Value"
                        error={!!formState.errors.attributes?.[idx]?.value}
                        className="px-4 py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeAttribute(idx)}
              className={cn(
                "p-2 !text-red-600 hover:bg-red-50 rounded-lg cursor-pointer mt-0",
                attributeFields.length === 1 && "cursor-not-allowed"
              )}
              disabled={attributeFields.length === 1}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attributes;
