import { Switch } from "@/components/ui/switch";
import { IProduct } from "@/interfaces/product.interface";

type ProductListingSwitchCellProps = {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function ProductListingSwitchCell({
  checked,
  disabled,
  onCheckedChange,
}: ProductListingSwitchCellProps) {
  return (
    <div
      className="flex h-8 items-center"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export function buildListingPatch(
  product: IProduct,
  field: "isMoment" | "pinTrending" | "archived",
  checked: boolean
): Partial<IProduct> {
  if (field === "archived") {
    return checked
      ? { archived: true, isMoment: false, pinTrending: false }
      : { archived: false };
  }

  if (field === "isMoment") {
    return {
      isMoment: checked,
      pinTrending: checked ? (product.pinTrending ?? false) : false,
      archived: product.archived ?? false,
    };
  }

  return {
    pinTrending: checked,
    isMoment: product.isMoment ?? true,
    archived: product.archived ?? false,
  };
}
