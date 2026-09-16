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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/hooks/use-file";
import {
  ICollectionProductCard,
  IProductIngest,
} from "@/interfaces/collection.interface";
import { IFile } from "@/interfaces/file.interface";
import { productImageSrc } from "@/lib/product-image";
import { notify } from "@/lib/toast";
import {
  HomepageSpotlightSection,
  IHomepageSpotlightImage,
  IHomepageSpotlightItem,
  SPOTLIGHT_DISPLAY_LIMITS,
  useAddHomepageSpotlightMutation,
  useGetHomepageSpotlightQuery,
  useRemoveHomepageSpotlightMutation,
  useReorderHomepageSpotlightMutation,
  useUpdateHomepageSpotlightMutation,
} from "@/services/homepage-spotlight.service";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const SECTIONS: Array<{
  value: HomepageSpotlightSection;
  label: string;
  hint: string;
  maxImages: number;
}> = [
  {
    value: "hot_selling",
    label: "Hot Selling",
    hint: "Paste product links to build the pool. Toggle Show for homepage; each selected product uses up to 4 images.",
    maxImages: 4,
  },
  {
    value: "featured",
    label: "Featured",
    hint: "Paste product links, then toggle Show. Only the first 6 shown products appear on the homepage.",
    maxImages: 1,
  },
  {
    value: "top_deals",
    label: "Top Deals",
    hint: "Paste product links, then toggle Show. Only the first 12 shown products appear on the homepage.",
    maxImages: 1,
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
  maxImages,
  hint,
}: {
  section: HomepageSpotlightSection;
  maxImages: number;
  hint: string;
}) => {
  const [links, setLinks] = useState("");
  const [pollIngest, setPollIngest] = useState(false);
  const [notice, setNotice] = useState<IProductIngest | null>(null);
  const watchedIngest = useRef(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<IHomepageSpotlightItem | null>(null);
  const [editImages, setEditImages] = useState<IHomepageSpotlightImage[]>([]);

  const displayLimit = SPOTLIGHT_DISPLAY_LIMITS[section];

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
    displayLimit == null
      ? visibleCount
      : Math.min(visibleCount, displayLimit);

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
    const images = [...(item.images?.length ? item.images : [{ url: item.image }])];
    while (images.length < maxImages) {
      images.push({ url: "" });
    }
    setEditImages(images.slice(0, maxImages));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const images = editImages
      .map((image) => ({
        url: image.url.trim(),
        key: image.key,
        filename: image.filename,
      }))
      .filter((image) => !!image.url);

    if (!images.length) {
      notify("Add at least one image");
      return;
    }

    try {
      await updateItem({
        id: editing.id,
        images,
        image: images[0].url,
      }).unwrap();
      notify("Images updated");
      setEditing(null);
    } catch (err: any) {
      notify(err?.data?.message || "Failed to update images");
    }
  };

  const onImageUploaded = (slot: number, files: IFile[]) => {
    const file = files[0];
    if (!file?.url) return;
    setEditImages((prev) => {
      const next = [...prev];
      next[slot] = {
        url: file.url,
        key: file.key,
        filename: file.fileName,
      };
      return next;
    });
  };

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
              <div key={item.id} className="space-y-2">
                <CollectionProductCard
                  product={toCard(item)}
                  removing={removing && removingId === item.id}
                  onRemove={() => handleRemove(item.id)}
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
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => openEdit(item)}
                  >
                    <ImageIcon className="mr-1.5 size-3.5" />
                    Images
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editing && (
              <p className="line-clamp-2 text-sm text-zinc-600">
                {editing.description}
              </p>
            )}
            {editImages.map((image, slot) => (
              <div key={slot} className="space-y-2 rounded-md border p-3">
                <Label>
                  Image {slot + 1}
                  {maxImages === 1 ? "" : slot === 0 ? " (main)" : " (thumb)"}
                </Label>
                {image.url ? (
                  <div className="relative overflow-hidden rounded-md bg-zinc-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={productImageSrc(image.url)}
                      alt={`Slot ${slot + 1}`}
                      className="h-40 w-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={() =>
                        setEditImages((prev) => {
                          const next = [...prev];
                          next[slot] = { url: "" };
                          return next;
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    label="Upload image"
                    isMultiple={false}
                    noOfFiles={1}
                    setUploadedFiles={(files) => onImageUploaded(slot, files)}
                  />
                )}
                <Input
                  placeholder="Or paste image URL"
                  value={image.url}
                  onChange={(e) =>
                    setEditImages((prev) => {
                      const next = [...prev];
                      next[slot] = { ...next[slot], url: e.target.value };
                      return next;
                    })
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={updating}>
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
    useState<HomepageSpotlightSection>("hot_selling");

  useEffect(() => {
    document.title = "Spotlight | Shipro Africa";
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-xl font-semibold">Spotlight</h1>
        <p className="text-sm text-zinc-500">
          Manage Hot Selling, Featured, and Top Deals on the homepage. Add
          products from links like Top Products, then choose which ones to show.
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
            <SectionPanel
              section={item.value}
              maxImages={item.maxImages}
              hint={item.hint}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SpotlightPage;
