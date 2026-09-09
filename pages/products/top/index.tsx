import CollectionProductCard from "@/components/pages/collections/collection-product-card";
import { Icons } from "@/components/shared/icons";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ICollectionProductCard } from "@/interfaces/collection.interface";
import { notify } from "@/lib/toast";
import {
  useAddTopProductsMutation,
  useGetTopProductsQuery,
  useRemoveTopProductMutation,
} from "@/services/top-product.service";
import { PaginationState } from "@tanstack/react-table";
import { Link2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const TopProductsPage = () => {
  const [links, setLinks] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 24,
  });

  const { data, isLoading, isFetching } = useGetTopProductsQuery({
    page: pagination.pageIndex - 1,
    limit: pagination.pageSize,
  });
  const [addProducts, { isLoading: adding }] = useAddTopProductsMutation();
  const [removeProduct, { isLoading: removing }] =
    useRemoveTopProductMutation();

  const products = (data?.data?.data ?? []).map(
    (product): ICollectionProductCard => ({
      id: String(product.id),
      image: product.image,
      description: product.description,
      url: product.url,
      moq: product.moq,
      amountYen: product.amountYen,
      amountNaira: product.amountNaira,
      company: product.company,
      stock: product.stock ?? null,
      soldOut: product.soldOut ?? false,
      rating: product.rating ?? null,
      totalSold: product.totalSold ?? null,
      totalSoldDuration: product.totalSoldDuration,
      location: product.location ?? null,
      internalProduct: product.internalProduct ?? false,
      category: product.category ?? null,
      source: product.source ?? (product.internalProduct ? "shipro" : "1688"),
      sortOrder: 0,
    })
  );
  const totalPages = data?.data?.totalPages ?? 0;
  const totalCount = data?.data?.totalCount ?? 0;

  useEffect(() => {
    document.title = "Top Products | Shipro Africa";
  }, []);

  const handleAdd = async () => {
    if (!links.trim()) {
      notify("Paste at least one product link");
      return;
    }
    try {
      const res = await addProducts({ links }).unwrap();
      const { added, skipped, failed } = res.data;
      notify(
        [
          `${added} added`,
          skipped ? `${skipped} already listed` : null,
          failed.length ? `${failed.length} failed` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      );
      if (failed.length) {
        notify(
          failed
            .slice(0, 3)
            .map((f) => `${f.input}: ${f.error}`)
            .join(" · "),
          "error"
        );
      }
      setLinks("");
    } catch (err: any) {
      notify(err?.data?.message || "Failed to add products");
    }
  };

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeProduct(productId).unwrap();
      notify("Product removed");
    } catch (err: any) {
      notify(err?.data?.message || "Failed to remove product");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-xl font-semibold">Top products</h1>
        <p className="text-sm text-zinc-500">
          These products power Top Sellers on the storefront. Paste Shipro or
          1688 links to add more, or remove any you no longer want. Card data
          is saved once and not fetched live on the client.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border bg-white p-5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Link2 className="size-4" /> Add products
        </label>
        <Textarea
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder={`Paste links or ids, separated by commas or new lines\n\nhttps://detail.1688.com/offer/123456.html,\nhttps://shipro.africa/products/uuid-here`}
          className="min-h-28 font-mono text-xs"
        />
        <Button type="button" onClick={handleAdd} disabled={adding || !links.trim()}>
          {adding ? (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          Fetch & add
        </Button>
      </section>

      <section className="space-y-4">
        <p className="text-sm text-zinc-500">
          {totalCount} product{totalCount === 1 ? "" : "s"}
        </p>
        {isLoading && !products.length ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Loading top products…
          </p>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No top products yet. Paste links above to add some.
          </p>
        ) : (
          <>
            <div
              className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {products.map((product) => (
                <CollectionProductCard
                  key={product.id}
                  product={product}
                  removing={removing && removingId === product.id}
                  onRemove={() => handleRemove(product.id)}
                />
              ))}
            </div>
            <AdvancedPagination
              totalPages={Math.max(totalPages, 1)}
              totalItems={totalCount}
              initialPage={pagination.pageIndex}
              isLoading={isLoading || isFetching}
              pageSize={pagination.pageSize}
              pageSizeOptions={[24, 48, 72, 100]}
              showPageSizeSelector
              showItemRange
              onPageSizeChange={(size) =>
                setPagination((prev) => ({
                  ...prev,
                  pageSize: size,
                  pageIndex: 1,
                }))
              }
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, pageIndex: page }))
              }
            />
          </>
        )}
      </section>
    </div>
  );
};

export default TopProductsPage;
