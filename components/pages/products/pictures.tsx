import ProductImageGrid from "@/components/pages/products/product-image-grid";
import { ProductFormInput } from "@/schemas/product";
import { UseFormReturn } from "react-hook-form";
import { UppyFile, Meta } from "@uppy/core";

interface PictureProps {
  form: UseFormReturn<ProductFormInput>;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setFileContainerRef: (node: HTMLDivElement | null) => void;
  handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  files: UppyFile<Meta, any>[];
  calculateOverallProgress: number;
}

const Picture = ({ form, ...uploadProps }: PictureProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pictures</h3>
      {form.formState.errors.images?.message && (
        <p className="text-sm text-red-600 mb-2">
          {form.formState.errors.images?.message}
        </p>
      )}
      <ProductImageGrid form={form} {...uploadProps} />
    </div>
  );
};

export default Picture;
