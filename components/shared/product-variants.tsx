import RichTextContent from "@/components/ui/rich-text-content";
import { cn } from "@/lib/utils";

export type ProductVariantValue = {
  normalized?: string;
  original: string;
};

export type ProductVariantsMap = Record<string, ProductVariantValue>;

interface ProductVariantsProps {
  variants?: ProductVariantsMap | null;
  className?: string;
  itemClassName?: string;
  showLabels?: boolean;
}

const ProductVariants = ({
  variants,
  className,
  itemClassName,
  showLabels = true,
}: ProductVariantsProps) => {
  const entries = Object.entries(variants ?? {});
  if (!entries.length) return null;

  return (
    <div className={cn("space-y-1", className)}>
      {entries.map(([key, value]) => (
        <p key={key} className={cn("break-words", itemClassName)}>
          {showLabels ? `${key}: ` : null}
          <RichTextContent
            html={value.original}
            as="span"
            className="[&_p]:inline [&_p]:m-0"
          />
        </p>
      ))}
    </div>
  );
};

export default ProductVariants;
