import { Icons } from "@/components/shared/icons";
import { IProductIngest } from "@/interfaces/collection.interface";
import { X } from "lucide-react";

const isActive = (status?: IProductIngest["status"]) =>
  status === "queued" || status === "processing";

export const productIngestIsActive = isActive;

type Props = {
  ingest?: IProductIngest | null;
  onDismiss?: () => void;
};

const ProductIngestBanner = ({ ingest, onDismiss }: Props) => {
  if (!ingest) return null;

  if (isActive(ingest.status)) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
        <Icons.spinner className="mt-0.5 size-4 shrink-0 animate-spin" />
        <p>
          Fetching products in the background
          {ingest.total ? ` (${ingest.total} links)` : ""}.
        </p>
      </div>
    );
  }

  const failures = ingest.failed ?? [];
  if (ingest.status !== "failed" && !failures.length) return null;

  return (
    <div className="relative rounded-md border border-red-200 bg-red-50 px-3 py-2 pr-8 text-sm text-red-700">
      {onDismiss && (
        <button
          type="button"
          className="absolute right-2 top-2 text-red-500 hover:text-red-800"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
      <p>
        {ingest.status === "failed"
          ? ingest.error || "Product fetch failed."
          : `${failures.length} link${failures.length === 1 ? "" : "s"} could not be fetched.`}
      </p>
      {failures.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {failures.slice(0, 8).map((item) => (
            <li key={`${item.input}-${item.error}`}>
              {item.input}
              {item.error ? ` — ${item.error}` : ""}
            </li>
          ))}
          {failures.length > 8 && <li>and {failures.length - 8} more</li>}
        </ul>
      )}
    </div>
  );
};

export default ProductIngestBanner;
