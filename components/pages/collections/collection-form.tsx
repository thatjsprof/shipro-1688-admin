import CollectionProductCard from "@/components/pages/collections/collection-product-card";
import { Icons } from "@/components/shared/icons";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/hooks/use-file";
import { IFile } from "@/interfaces/file.interface";
import {
  collectionFormSchema,
  CollectionFormValues,
} from "@/schemas/collection";
import { productImageSrc } from "@/lib/product-image";
import { notify } from "@/lib/toast";
import {
  useAddCollectionProductsMutation,
  useCreateCollectionMutation,
  useGetCollectionProductsQuery,
  useGetCollectionQuery,
  useRemoveCollectionProductMutation,
  useUpdateCollectionMutation,
} from "@/services/collection.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaginationState } from "@tanstack/react-table";
import { ArrowLeft, Link2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  mode: "create" | "edit";
  collectionId?: string;
};

const CollectionForm = ({ mode, collectionId }: Props) => {
  const router = useRouter();
  const isEdit = mode === "edit" && !!collectionId;

  const { data: collectionRes, isLoading: loadingCollection } =
    useGetCollectionQuery(collectionId!, { skip: !isEdit });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 24,
  });
  const {
    data: productsRes,
    isLoading: loadingProducts,
    isFetching: fetchingProducts,
  } = useGetCollectionProductsQuery(
    {
      id: collectionId!,
      page: pagination.pageIndex - 1,
      limit: pagination.pageSize,
    },
    { skip: !isEdit }
  );

  const [createCollection, { isLoading: creating }] =
    useCreateCollectionMutation();
  const [updateCollection, { isLoading: updating }] =
    useUpdateCollectionMutation();
  const [addProducts, { isLoading: adding }] =
    useAddCollectionProductsMutation();
  const [removeProduct, { isLoading: removing }] =
    useRemoveCollectionProductMutation();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addLinks, setAddLinks] = useState("");

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      coverImage: "",
      active: true,
      productLinks: "",
    },
  });

  useEffect(() => {
    const collection = collectionRes?.data;
    if (!collection) return;
    form.reset({
      title: collection.title,
      description: collection.description ?? "",
      coverImage: collection.coverImage ?? "",
      active: collection.active,
      productLinks: "",
    });
  }, [collectionRes, form]);

  const coverImage = form.watch("coverImage");
  const products = productsRes?.data?.data ?? [];
  const totalPages = productsRes?.data?.totalPages ?? 0;
  const productCount =
    productsRes?.data?.collection?.productCount ??
    collectionRes?.data?.productCount ??
    0;

  const onCoverUploaded = (files: IFile[]) => {
    const file = files[0];
    if (file?.url) {
      form.setValue("coverImage", file.url, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: CollectionFormValues) => {
    try {
      if (isEdit && collectionId) {
        await updateCollection({
          id: collectionId,
          body: {
            title: values.title,
            description: values.description,
            coverImage: values.coverImage || null,
            active: values.active,
          },
        }).unwrap();
        notify("Collection updated");
      } else {
        const res = await createCollection({
          title: values.title,
          description: values.description,
          coverImage: values.coverImage || null,
          active: values.active,
          productLinks: values.productLinks,
        }).unwrap();

        const resolve = res.data.resolve;
        if (resolve) {
          const parts = [
            `${resolve.added} added`,
            resolve.skipped ? `${resolve.skipped} skipped` : null,
            resolve.failed.length
              ? `${resolve.failed.length} failed`
              : null,
          ].filter(Boolean);
          notify(
            parts.length
              ? `Collection created (${parts.join(", ")})`
              : "Collection created"
          );
          if (resolve.failed.length) {
            notify(
              resolve.failed
                .slice(0, 3)
                .map((f) => `${f.input}: ${f.error}`)
                .join(" · "),
              "error"
            );
          }
        } else {
          notify(res.message || "Collection created");
        }
        router.push(`/collections/${res.data.id}`);
      }
    } catch (err: any) {
      notify(err?.data?.message || "Something went wrong");
    }
  };

  const handleAddProducts = async () => {
    if (!collectionId || !addLinks.trim()) {
      notify("Paste at least one product link");
      return;
    }
    try {
      const res = await addProducts({
        id: collectionId,
        links: addLinks,
      }).unwrap();
      const { added, skipped, failed } = res.data;
      notify(
        [
          `${added} added`,
          skipped ? `${skipped} already in collection` : null,
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
      setAddLinks("");
    } catch (err: any) {
      notify(err?.data?.message || "Failed to add products");
    }
  };

  const handleRemove = async (productId: string) => {
    if (!collectionId) return;
    setRemovingId(productId);
    try {
      await removeProduct({ id: collectionId, productId }).unwrap();
      notify("Product removed");
    } catch (err: any) {
      notify(err?.data?.message || "Failed to remove product");
    } finally {
      setRemovingId(null);
    }
  };

  if (isEdit && loadingCollection) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-zinc-500">
        Loading collection…
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft className="size-4" /> Back to collections
          </Link>
          <h1 className="text-xl font-semibold">
            {isEdit ? "Edit collection" : "New collection"}
          </h1>
          <p className="text-sm text-zinc-500">
            {isEdit
              ? "Update details, then paste links to fetch and add more products."
              : "Add a title and cover, paste product links, then create — we fetch and save card data once."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-5 rounded-lg border bg-white p-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Summer gadgets" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short blurb for this collection"
                        className="min-h-24 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="productLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Link2 className="size-4" /> Product links
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Paste Shipro or 1688 links, separated by commas or new lines\n\nhttps://detail.1688.com/offer/123456.html,\nhttps://shipro.africa/products/uuid-here`}
                          className="min-h-36 font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        On create we fetch each product once and store card
                        fields (image, title, price, MOQ, etc.). Collection
                        pages never re-hit live URLs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4 rounded-lg border bg-white p-5">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                    <div>
                      <FormLabel className="mb-0">Active</FormLabel>
                      <FormDescription className="text-xs">
                        Visible on public routes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Cover image</FormLabel>
                {coverImage ? (
                  <div className="relative overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={productImageSrc(coverImage)}
                      alt="Cover"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={() => form.setValue("coverImage", "")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    label="Upload cover image"
                    isMultiple={false}
                    noOfFiles={1}
                    setUploadedFiles={onCoverUploaded}
                  />
                )}
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Or paste image URL"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={creating || updating}
              >
                {(creating || updating) && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                {isEdit ? "Save changes" : "Create & fetch products"}
              </Button>
            </div>
          </section>
        </form>
      </Form>

      {isEdit && collectionId && (
        <section className="space-y-5 rounded-lg border bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Products</h2>
              <p className="text-sm text-zinc-500">
                {productCount} product{productCount === 1 ? "" : "s"} in this
                collection
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-dashed bg-zinc-50/80 p-4">
            <label className="text-sm font-medium">Add more products</label>
            <Textarea
              value={addLinks}
              onChange={(e) => setAddLinks(e.target.value)}
              placeholder="Paste links or ids, separated by commas or new lines"
              className="min-h-24 bg-white font-mono text-xs"
            />
            <Button
              type="button"
              onClick={handleAddProducts}
              disabled={adding || !addLinks.trim()}
            >
              {adding ? (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              Fetch & add to collection
            </Button>
          </div>

          {loadingProducts && !products.length ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Loading products…
            </p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No products yet. Paste links above to fetch and save them.
            </p>
          ) : (
            <>
              <div
                className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
                  fetchingProducts ? "opacity-60" : ""
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
                totalItems={productCount}
                initialPage={pagination.pageIndex}
                isLoading={loadingProducts || fetchingProducts}
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
      )}
    </div>
  );
};

export default CollectionForm;
