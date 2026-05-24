import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import ListingSettings from "@/components/pages/products/listing-settings";
import { Icons } from "@/components/shared/icons";
import { IFile } from "@/interfaces/file.interface";
import { parseQuickProduct } from "@/lib/parse-quick-product";
import { syncVariantImageFromFirst } from "@/lib/quick-product-to-form";
import ProductImageGrid from "@/components/pages/products/product-image-grid";
import { ProductFormInput } from "@/schemas/product";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { UppyFile, Meta } from "@uppy/core";

export type QuickAddProps = {
  form: UseFormReturn<ProductFormInput>;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setFileContainerRef: (node: HTMLDivElement | null) => void;
  handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  files: UppyFile<Meta, any>[];
  calculateOverallProgress: number;
  onCreate: () => Promise<void>;
  isLoading: boolean;
};

export default function QuickAdd({
  form,
  isDragging,
  fileInputRef,
  setFileContainerRef,
  handleFileInputChange,
  uploading,
  files,
  calculateOverallProgress,
  onCreate,
  isLoading,
}: QuickAddProps) {
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const images = (form.watch("images") ?? []) as IFile[];

  useEffect(() => {
    if (images.length > 0) {
      syncVariantImageFromFirst(form);
    }
  }, [images, form]);

  const handleCreate = async () => {
    const quickAddText = form.getValues("quickAddText") ?? "";
    const description = form.getValues("description") ?? "";
    const variantValue =
      form.getValues("variantProperties")?.[0]?.values?.[0]?.value ?? "";
    const result = parseQuickProduct(quickAddText, {
      description,
      variantValue,
    });
    if (!result.success) {
      setParseErrors(result.errors);
      return;
    }
    if (images.length === 0) {
      setParseErrors(["At least one image is required"]);
      return;
    }
    setParseErrors([]);
    await onCreate();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick add</h3>
        <p className="text-sm text-gray-500 mb-4">
          Use the editors for description and variant value. Enter stock, price,
          and other fields below as <code className="text-xs">key: value</code>.
          The first uploaded picture is used as the variant image.
        </p>

        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem className="mb-4">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Description of this product"
                  error={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="variantProperties.0.values.0.value"
          render={({ field, fieldState }) => (
            <FormItem className="mb-4">
              <FormLabel>Variant value</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  compact
                  placeholder="Variant value"
                  error={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quickAddText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other fields</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    field.onChange(e);
                    setParseErrors([]);
                  }}
                  rows={6}
                  className="font-mono text-sm resize-y min-h-[9rem]"
                  spellCheck={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {parseErrors.length > 0 && (
          <ul className="mt-3 text-sm text-destructive space-y-1">
            {parseErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
      </div>

      <ListingSettings form={form} />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pictures</h3>
        <ProductImageGrid
          form={form}
          showVariantBadge
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          setFileContainerRef={setFileContainerRef}
          handleFileInputChange={handleFileInputChange}
          uploading={uploading}
          files={files}
          calculateOverallProgress={calculateOverallProgress}
          onImagesReordered={() => syncVariantImageFromFirst(form)}
        />
      </div>

      <Button
        type="button"
        disabled={isLoading || uploading}
        onClick={handleCreate}
        className="h-14 font-semibold px-6 shadow-none"
      >
        {isLoading && <Icons.spinner className="h-3 w-3 animate-spin" />}
        Create product
      </Button>
    </div>
  );
}
