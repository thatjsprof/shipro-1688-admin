import ProductIngestBanner, {
  productIngestIsActive,
} from "@/components/pages/collections/product-ingest-banner";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
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
import { IProductIngest } from "@/interfaces/collection.interface";
import { IFile } from "@/interfaces/file.interface";
import { productImageSrc } from "@/lib/product-image";
import { notify } from "@/lib/toast";
import {
  HomepageSpotlightSection,
  IHomepageSpotlightImage,
  IHomepageSpotlightItem,
  useAddHomepageSpotlightMutation,
  useGetHomepageSpotlightQuery,
  useRemoveHomepageSpotlightMutation,
  useReorderHomepageSpotlightMutation,
  useUpdateHomepageSpotlightMutation,
} from "@/services/homepage-spotlight.service";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
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
    hint: "Carousel on the left. Each visible product shows up to 4 images.",
    maxImages: 4,
  },
  {
    value: "featured",
    label: "Featured",
    hint: "Middle grid. Toggle which products show; first 6 visible items appear on the homepage.",
    maxImages: 1,
  },
  {
    value: "top_deals",
    label: "Top Deals",
    hint: "Right carousel. Visible products are paired into slides of 2.",
    maxImages: 1,
  },
];

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
  const [editTitle, setEditTitle] = useState("");
  const [editImages, setEditImages] = useState<IHomepageSpotlightImage[]>([]);

  const { data, isLoading, isFetching } = useGetHomepageSpotlightQuery(section, {
    pollingInterval: pollIngest ? 3000 : 0,
  });
  const items = data?.data?.data ?? [];
  const ingest = data?.data?.ingest;
  const visibleCount = useMemo(
    () => items.filter((item) => item.visible).length,
    [items]
  );

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
      notify(visible ? "Showing on homepage" : "Hidden from homepage");
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
    setEditTitle(item.title);
    const images = [...(item.images ?? [])];
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
        title: editTitle.trim() || editing.title,
        images,
      }).unwrap();
      notify("Spotlight item updated");
      setEditing(null);
    } catch (err: any) {
      notify(err?.data?.message || "Failed to update item");
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
          <Link2 className="size-4" /> Add products to pool
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
          New products are added as hidden. Turn on Show to put them on the
          homepage.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-zinc-500">
            {items.length} in pool · {visibleCount} showing
          </p>
        </div>

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
            No products yet. Paste links above to build the pool.
          </p>
        ) : (
          <div
            className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
              isFetching || reordering ? "opacity-60" : ""
            }`}
          >
            {items.map((item, index) => {
              const preview = item.images?.[0]?.url;
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-md border bg-white shadow-sm"
                >
                  <div className="relative aspect-square bg-zinc-50">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productImageSrc(preview)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute left-2 top-2 bg-white/90 text-[0.65rem]"
                    >
                      {item.source === "shipro" ? "Shipro" : "External"}
                    </Badge>
                    {item.images?.length > 1 && (
                      <Badge className="absolute bottom-2 left-2 bg-black/70 text-[0.65rem]">
                        {item.images.length} images
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3 p-3">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor={`visible-${item.id}`}
                        className="flex items-center gap-2 text-xs text-zinc-600"
                      >
                        {item.visible ? (
                          <Eye className="size-3.5" />
                        ) : (
                          <EyeOff className="size-3.5" />
                        )}
                        Show
                      </Label>
                      <Switch
                        id={`visible-${item.id}`}
                        checked={item.visible}
                        onCheckedChange={(checked) =>
                          handleToggleVisible(item, checked)
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(item)}
                      >
                        <ImageIcon className="mr-1.5 size-3.5" />
                        Images
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
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
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="ml-auto h-8 w-8"
                        disabled={removing && removingId === item.id}
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <DialogTitle>Edit spotlight images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spotlight-title">Title</Label>
              <Input
                id="spotlight-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
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

const HomepageSpotlightPage = () => {
  const [section, setSection] =
    useState<HomepageSpotlightSection>("hot_selling");

  useEffect(() => {
    document.title = "Homepage Spotlight | Shipro Africa";
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-xl font-semibold">Homepage spotlight</h1>
        <p className="text-sm text-zinc-500">
          Manage the Hot Selling, Featured, and Top Deals cards on the storefront
          homepage. Add products to each pool, choose which ones show, and change
          their images.
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

export default HomepageSpotlightPage;
