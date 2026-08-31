import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveProductSku } from "@/lib/variant-sku";
import ProductVariants from "@/components/shared/product-variants";
import RichTextContent from "@/components/ui/rich-text-content";
import { stripRichHtml } from "@/lib/rich-text";
import { useGetCartQuery } from "@/services/cart.service";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/router";

const Cart = () => {
  const router = useRouter();
  const { id } = router.query;
  const idToUse = id as string;
  const { data, isLoading, refetch, isFetching } = useGetCartQuery(idToUse, {
    skip: !idToUse,
  });
  const items = data?.data?.items || [];

  const handleRefresh = async () => {
    await refetch().unwrap();
  };

  return (
    <div className="mt-4 max-w-5xl">
      {isLoading ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }, (_, i) => i + 1).map((i) => {
            return (
              <div className="p-3 -m-3 rounded-lg" key={i}>
                <div className="flex items-start gap-5">
                  <Skeleton className="h-16 w-16 rounded-sm" />
                  <div className="flex justify-between gap-5 flex-1">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-24 mt-2 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : items.length === 0 ? (
        <div className="w-full flex justify-center mt-10">
          <p className="text-2xl font-semibold">No items in cart</p>
        </div>
      ) : (
        <div>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={handleRefresh}
            className="shadow-none w-12 h-12 mb-6"
          >
            {isFetching ? (
              <Icons.spinner className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCcw className="size-5" />
            )}
          </Button>
          <div className="flex flex-col gap-5">
            {items.map((i) => {
              const product = i.product;
              const resolved = resolveProductSku(product, i.variants ?? {});
              const weight = resolved?.sku?.weight ?? 0;

              return (
                <div key={i.id}>
                  <div className="flex items-start gap-5">
                    <div
                      className="h-24 w-24 rounded-sm border hover:opacity-80 transition-opacity flex-shrink-0 overflow-hidden"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <img
                        className="h-full w-full object-cover"
                        src={`${process.env.SERVER_URL}/proxy?url=${product.image}`}
                        alt={stripRichHtml(product.description)}
                      />
                    </div>
                    <div className="flex justify-between gap-5">
                      <div className="flex flex-col gap-1 -mt-1">
                        <RichTextContent html={product.description} />
                        <ProductVariants
                          variants={i.variants}
                          itemClassName="text-zinc-600"
                        />
                        <p className="text-zinc-600">
                          Qty: {i.quantity}
                          {`${weight ? `, Weight: ${weight}kg` : ""}`}
                        </p>
                        {(product?.url || product?.internalProduct) && (
                          <a
                            target="_blank"
                            href={
                              product?.internalProduct
                                ? `${process.env.CLIENT_URL}/products/${product.id}`
                                : product.url
                            }
                            className="text-[#fc6320] hover:underline break-all line-clamp-1 w-fit"
                          >
                            {product?.internalProduct
                              ? `${process.env.CLIENT_URL}/products/${product.id}`
                              : product.url}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
