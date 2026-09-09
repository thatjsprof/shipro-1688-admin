import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ICollectionProductCard } from "@/interfaces/collection.interface";
import { cn, formatNum } from "@/lib/utils";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

type Props = {
  product: ICollectionProductCard;
  onRemove?: () => void;
  removing?: boolean;
  className?: string;
};

const CollectionProductCard = ({
  product,
  onRemove,
  removing,
  className,
}: Props) => {
  const clientUrl = process.env.CLIENT_URL;
  const href = product.internalProduct
    ? `${clientUrl}/products/${product.id}`
    : product.url || `${clientUrl}/products/${product.id}`;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border bg-white shadow-sm",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.description}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 bg-white/90 text-[0.65rem] font-medium"
        >
          {product.source === "shipro" ? "Shipro" : "External"}
        </Badge>
        {onRemove && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            disabled={removing}
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {product.description || "Untitled product"}
        </p>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold">
            ₦{formatNum(product.amountNaira ?? 0)}
          </p>
          {product.moq != null && (
            <p className="text-xs text-zinc-500">MOQ {product.moq}</p>
          )}
        </div>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900"
        >
          Open <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );
};

export default CollectionProductCard;
