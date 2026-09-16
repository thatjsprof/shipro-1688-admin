import CollectionProductCard from "@/components/pages/collections/collection-product-card";
import ProductIngestBanner, {
  productIngestIsActive,
} from "@/components/pages/collections/product-ingest-banner";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ICollectionProductCard,
  IProductIngest,
} from "@/interfaces/collection.interface";
import { productImageSrc } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import {
  HomepageSpotlightSection,
  IHomepageSpotlightImage,
  IHomepageSpotlightItem,
  SPOTLIGHT_DISPLAY_LIMITS,
  SPOTLIGHT_IMAGE_LIMITS,
  useAddHomepageSpotlightMutation,
  useGetHomepageSpotlightQuery,
  useRemoveHomepageSpotlightMutation,
  useReorderHomepageSpotlightMutation,
  useUpdateHomepageSpotlightMutation,
} from "@/services/homepage-spotlight.service";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ImageIcon,
  Link2,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const SECTIONS: Array<{
  value: HomepageSpotlightSection;
  label: string;
  hint: string;
}> = [
  {
    value: "featured",
    label: "Featured",
    hint: "Paste product links, toggle Show, then pick 1 thumbnail per product. First 6 shown products appear on the homepage.",
  },
  {
    value: "top_deals",
    label: "Top Deals",
    hint: "Paste product links, toggle Show, then pick 1 thumbnail per product. First 12 shown products appear on the homepage.",
  },
];

const toCard = (item: IHomepageSpotlightItem): ICollectionProductCard => ({
  id: item.productId,
  image: item.image,
  description: item.description,
  url: item.url,
  moq: item.moq,
  amountYen: item.amountYen,
  amountNaira: item.amountNaira,
  company: item.company,
  stock: item.stock ?? null,
  soldOut: item.soldOut ?? false,
  rating: item.rating ?? null,
  totalSold: item.totalSold ?? null,
  totalSoldDuration: item.totalSoldDuration,
  location: item.location ?? null,
  internalProduct: item.internalProduct ?? false,
  category: item.category ?? null,
  source: item.source ?? (item.internalProduct ? "shipro" : "1688"),
  sortOrder: item.sortOrder,
});

const SectionPanel = ({
  section,
  hint,
}: {
  section: HomepageSpotlightSection;
  hint: string;
}) => {
  const [links, setLinks] = useState("");
  const [pollIngest, setPollIngest] = useState(false);
  const [notice, setNotice] = useState<IProductIngest | null>(null);
  const watchedIngest = useRef(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<IHomepageSpotlightItem | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const displayLimit = SPOTLIGHT_DISPLAY_LIMITS[section];
  const imageLimit = SPOTLIGHT_IMAGE_LIMITS[section];

  const { data, isLoading, isFetching } = useGetHomepageSpotlightQuery(section, {
    pollingInterval: pollIngest ? 3000 : 0,
  });
  const items = data?.data?.data ?? [];
  const ingest = data?.data?.ingest;
  const visibleCount = useMemo(
    () => items.filter((item) => item.visible).length,
    [items]
  );
  const showingCount =
    displayLimit == null ? visibleCount : Math.min(visibleCount, displayLimit);

  const [addProducts, { isLoading: adding }] =
    useAddHomepageSpotlightMutation();
  const [updateItem, { isLoading: updating }] =
    useUpdateHomepageSpotlightMutation();
  const [removeItem, { isLoading: removing }] =
    useRemoveHomepageSpotlightMutation();
  const [reorderItems, { isLoading: reordering }] =
    useReorderHomepageSpotlightMutation();

  useEffect(() => {
    const current = data?.data?.ingest;
    const active = productIngestIsActive(current?.status);
    setPollIngest(active);
    if (active) {
      watchedIngest.current = true;
      setNotice(null);
      return;
    }
    if (!watchedIngest.current || !current) return;
    watchedIngest.current = false;
    if (current.status === "failed" || current.failed?.length) {
      setNotice(current);
    }
  }, [data?.data?.ingest]);

  const handleAdd = async () => {
    if (!links.trim()) {
      notify("Paste at least one product link");
      return;
    }
    try {
      await addProducts({ section, links }).unwrap();
      notify("Fetching products in the background");
      setLinks("");
      setPollIngest(true);
    } catch (err: any) {
      notify(err?.data?.message || "Failed to add products");
    }
  };

  const handleToggleVisible = async (
    item: IHomepageSpotlightItem,
    visible: boolean
  ) => {
    try {
      await updateItem({ id: item.id, visible }).unwrap();
      notify(visible ? "Marked to show" : "Hidden from homepage");
    } catch (err: any) {
      notify(err?.data?.message || "Failed to update visibility");
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeItem(id).unwrap();
      notify("Product removed");
    } catch (err: any) {
      notify(err?.data?.message || "Failed to remove product");
    } finally {
      setRemovingId(null);
    }
  };

  const moveItem = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const ids = items.map((item) => item.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(next, 0, moved);
    try {
      await reorderItems({ section, ids }).unwrap();
    } catch (err: any) {
      notify(err?.data?.message || "Failed to reorder");
    }
  };

  const openEdit = (item: IHomepageSpotlightItem) => {
    setEditing(item);
    const selected = (item.images?.length ? item.images : [{ url: item.image }])
      .map((image) => image.url)
      .filter(Boolean);
    // Deduplicate padded hot-selling repeats for the picker UI
    setSelectedUrls([...new Set(selected)].slice(0, imageLimit));
  };

  const toggleThumbnail = (url: string) => {
    setSelectedUrls((prev) => {
      if (prev.includes(url)) {
        return prev.filter((item) => item !== url);
      }
      if (imageLimit === 1) return [url];
      if (prev.length >= imageLimit) {
        return [...prev.slice(1), url];
      }
      return [...prev, url];
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!selectedUrls.length) {
      notify("Select at least one thumbnail");
      return;
    }

    const galleryByUrl = new Map(
      (editing.gallery?.length
        ? editing.gallery
        : editing.images?.length
          ? editing.images
          : [{ url: editing.image }]
      ).map((image) => [image.url, image])
    );

    const images: IHomepageSpotlightImage[] = selectedUrls
      .map((url) => galleryByUrl.get(url) || { url })
      .slice(0, imageLimit);

    try {
      await updateItem({
        id: editing.id,
        images,
      }).unwrap();
      notify("Thumbnails updated");
      setEditing(null);
    } catch (err: any) {
      notify(err?.data?.message || "Failed to update thumbnails");
    }
  };

  const editingGallery = useMemo(() => {
    if (!editing) return [];
    if (editing.gallery?.length) return editing.gallery;
    if (editing.images?.length) return editing.images;
    return editing.image ? [{ url: editing.image }] : [];
  }, [editing]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500">{hint}</p>

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
        <Button
          type="button"
          onClick={handleAdd}
          disabled={adding || !links.trim()}
        >
          {adding ? (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          Fetch & add
        </Button>
        <p className="text-xs text-zinc-500">
          New products are added hidden. Turn on Show to include them
          {displayLimit != null
            ? `. If more than ${displayLimit} are shown, only the first ${displayLimit} (by order) are used on the homepage.`
            : "."}
        </p>
      </section>

      <section className="space-y-4">
        <p className="text-sm text-zinc-500">
          {items.length} in pool · {visibleCount} selected · {showingCount} will
          show on homepage
        </p>

        <ProductIngestBanner
          ingest={productIngestIsActive(ingest?.status) ? ingest : notice}
          onDismiss={() => setNotice(null)}
        />

        {isLoading && !items.length ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Loading spotlight products…
          </p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No products yet. Paste links above to add some.
          </p>
        ) : (
          <div
            className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
              isFetching || reordering ? "opacity-60" : ""
            }`}
          >
            {items.map((item, index) => (
              <div key={item.id} className="flex h-full flex-col gap-2">
                <CollectionProductCard
                  product={toCard(item)}
                  removing={removing && removingId === item.id}
                  onRemove={() => handleRemove(item.id)}
                  className="flex-1"
                />
                <div className="flex flex-wrap items-center gap-2 rounded-md border bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`visible-${item.id}`}
                      checked={item.visible}
                      onCheckedChange={(checked) =>
                        handleToggleVisible(item, checked)
                      }
                    />
                    <Label
                      htmlFor={`visible-${item.id}`}
                      className="text-xs text-zinc-600"
                    >
                      Show
                    </Label>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => openEdit(item)}
                    aria-label="Select images"
                  >
                    <ImageIcon className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="ml-auto h-8 w-8"
                    disabled={index === 0 || reordering}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={index === items.length - 1 || reordering}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select thumbnails</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editing && (
              <p className="line-clamp-2 text-sm text-zinc-600">
                {editing.description}
              </p>
            )}
            <p className="text-xs text-zinc-500">
              Pick from this product’s gallery. Select up to {imageLimit}.
              {selectedUrls.length
                ? ` ${selectedUrls.length} selected.`
                : " None selected yet."}
            </p>
            {editingGallery.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                No thumbnails found for this product.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {editingGallery.map((image) => {
                  const selectedIndex = selectedUrls.indexOf(image.url);
                  const selected = selectedIndex >= 0;
                  return (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => toggleThumbnail(image.url)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-md border-2 bg-zinc-50 transition",
                        selected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-zinc-300"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={productImageSrc(image.url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {selected && (
                        <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {imageLimit === 1 ? (
                            <Check className="size-3.5" />
                          ) : (
                            selectedIndex + 1
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={updating || !selectedUrls.length}
            >
              {updating && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SpotlightPage = () => {
  const [section, setSection] =
    useState<HomepageSpotlightSection>("featured");

  useEffect(() => {
    document.title = "Spotlight | Shipro Africa";
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-xl font-semibold">Spotlight</h1>
        <p className="text-sm text-zinc-500">
          Manage Featured and Top Deals on the homepage. Hot Selling stays
          automatic (random in-stock Shipro products). Add products from links,
          choose which show, and pick thumbnails from each product’s gallery.
        </p>
      </div>

      <Tabs
        value={section}
        onValueChange={(value) =>
          setSection(value as HomepageSpotlightSection)
        }
      >
        <TabsList>
          {SECTIONS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SECTIONS.map((item) => (
          <TabsContent key={item.value} value={item.value} className="mt-6">
            <SectionPanel section={item.value} hint={item.hint} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SpotlightPage;
