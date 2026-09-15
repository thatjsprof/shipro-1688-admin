import ActionAlert from "@/components/ui/action-alert";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { ICollection } from "@/interfaces/collection.interface";
import { productImageSrc } from "@/lib/product-image";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  useDeleteCollectionMutation,
  useGetCollectionsQuery,
  useMoveCollectionMutation,
  useReorderCollectionsMutation,
  useUpdateCollectionMutation,
} from "@/services/collection.service";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CollectionsPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ICollection | null>(null);
  const [rows, setRows] = useState<ICollection[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const rowsRef = useRef<ICollection[]>([]);

  const { data, isLoading, isFetching } = useGetCollectionsQuery({
    page: pageIndex - 1,
    limit: pageSize,
    search: debouncedSearch,
  });
  const [updateCollection] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] =
    useDeleteCollectionMutation();
  const [moveCollection] = useMoveCollectionMutation();
  const [reorderCollections] = useReorderCollectionsMutation();

  const collections = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const canReorder = !debouncedSearch.trim();

  useEffect(() => {
    document.title = "Collections | Shipro Africa";
  }, []);

  useEffect(() => {
    setRows(collections);
    rowsRef.current = collections;
  }, [collections]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
        setPagination((prev) => ({ ...prev, pageIndex: 1 }));
      }, 350),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const handleToggleActive = useCallback(
    async (collection: ICollection, active: boolean) => {
      try {
        await updateCollection({
          id: collection.id,
          body: { active },
        }).unwrap();
        notify(active ? "Collection activated" : "Collection deactivated");
      } catch (err: any) {
        notify(err?.data?.message || "Failed to update collection");
      }
    },
    [updateCollection]
  );

  const handleToggleFeatured = useCallback(
    async (collection: ICollection, featured: boolean) => {
      try {
        await updateCollection({
          id: collection.id,
          body: { featured },
        }).unwrap();
        notify(
          featured
            ? "Collection marked as featured"
            : "Collection removed from featured"
        );
      } catch (err: any) {
        notify(err?.data?.message || "Failed to update collection");
      }
    },
    [updateCollection]
  );

  const handleMove = useCallback(
    async (collection: ICollection, direction: "up" | "down") => {
      if (!canReorder) return;
      try {
        setMovingId(collection.id);
        await moveCollection({ id: collection.id, direction }).unwrap();
      } catch (err: any) {
        notify(err?.data?.message || "Failed to reorder collection");
      } finally {
        setMovingId(null);
      }
    },
    [canReorder, moveCollection]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!toDelete) return;
    try {
      await deleteCollection(toDelete.id).unwrap();
      notify("Collection deleted");
      setDeleteOpen(false);
      setToDelete(null);
    } catch (err: any) {
      notify(err?.data?.message || "Failed to delete collection");
    }
  }, [deleteCollection, toDelete]);

  const onDragStart = useCallback(
    (index: number, id: string) => {
      if (!canReorder) return;
      dragIndexRef.current = index;
      setDraggingId(id);
    },
    [canReorder]
  );

  const onDragEnter = useCallback(
    (index: number) => {
      if (!canReorder || dragIndexRef.current === null) return;
      if (dragIndexRef.current === index) return;
      setRows((prev) => {
        const next = [...prev];
        const from = dragIndexRef.current!;
        const [moved] = next.splice(from, 1);
        next.splice(index, 0, moved);
        dragIndexRef.current = index;
        rowsRef.current = next;
        return next;
      });
    },
    [canReorder]
  );

  const onDragEnd = useCallback(async () => {
    const previous = collections;
    const nextIds = rowsRef.current.map((row) => row.id);
    const unchanged =
      previous.length === nextIds.length &&
      previous.every((row, index) => row.id === nextIds[index]);

    setDraggingId(null);
    dragIndexRef.current = null;
    if (!canReorder || unchanged) {
      setRows(previous);
      rowsRef.current = previous;
      return;
    }

    try {
      await reorderCollections({
        ids: nextIds,
        page: pageIndex - 1,
        limit: pageSize,
      }).unwrap();
      notify("Collection order updated");
    } catch (err: any) {
      setRows(previous);
      rowsRef.current = previous;
      notify(err?.data?.message || "Failed to reorder collections");
    }
  }, [canReorder, collections, pageIndex, pageSize, reorderCollections]);

  const columns = useMemo<ColumnDef<ICollection>[]>(
    () => [
      {
        id: "reorder",
        header: () => <span className="sr-only">Reorder</span>,
        cell: ({ row }) => {
          const index = row.index;
          const isFirst = pageIndex === 1 && index === 0;
          const isLast =
            (totalPages <= 1 || pageIndex === totalPages) &&
            index === rows.length - 1;
          const busy = movingId === row.original.id || !!draggingId;

          return (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                draggable={canReorder}
                onDragStart={() => onDragStart(index, row.original.id)}
                onDragEnter={() => onDragEnter(index)}
                onDragOver={(e: DragEvent) => e.preventDefault()}
                onDragEnd={onDragEnd}
                disabled={!canReorder}
                className={cn(
                  "flex size-8 items-center justify-center rounded text-zinc-400",
                  canReorder
                    ? "cursor-grab active:cursor-grabbing hover:bg-zinc-100 hover:text-zinc-700"
                    : "cursor-not-allowed opacity-40"
                )}
                title={
                  canReorder
                    ? "Drag to reorder"
                    : "Clear search to reorder collections"
                }
                aria-label="Drag to reorder"
              >
                <GripVertical className="size-4" />
              </button>
              <div className="flex flex-col">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  disabled={!canReorder || isFirst || busy}
                  onClick={() => handleMove(row.original, "up")}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  disabled={!canReorder || isLast || busy}
                  onClick={() => handleMove(row.original, "down")}
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "coverImage",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cover" />
        ),
        cell: ({ row }) => {
          const cover = row.original.coverImage;
          return cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={productImageSrc(cover)}
              alt=""
              className={cn(
                "h-12 w-16 rounded object-cover",
                draggingId === row.original.id && "opacity-50"
              )}
            />
          ) : (
            <div className="flex h-12 w-16 items-center justify-center rounded bg-zinc-100 text-[0.65rem] text-zinc-400">
              None
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => (
          <div className="max-w-xs">
            <p className="font-medium">{row.original.title}</p>
            <p className="truncate text-xs text-zinc-500">
              /{row.original.slug}
            </p>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "productCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Products" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.productCount}</Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Active" />
        ),
        cell: ({ row }) => (
          <Switch
            checked={row.original.active}
            onCheckedChange={(checked) =>
              handleToggleActive(row.original, checked)
            }
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "featured",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Featured" />
        ),
        cell: ({ row }) => (
          <Switch
            checked={row.original.featured}
            onCheckedChange={(checked) =>
              handleToggleFeatured(row.original, checked)
            }
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
          const d = new Date(row.original.createdAt);
          if (Number.isNaN(d.getTime())) return "—";
          return format(d, "dd MMM yyyy");
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => router.push(`/collections/${row.original.id}`)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setToDelete(row.original);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [
      canReorder,
      draggingId,
      handleMove,
      handleToggleActive,
      handleToggleFeatured,
      movingId,
      onDragEnd,
      onDragEnter,
      onDragStart,
      pageIndex,
      router,
      rows.length,
      totalPages,
    ]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Collections</h1>
          <p className="text-sm text-zinc-500">
            Curate Shipro and 1688 products into shareable collections. Drag or
            use arrows to set homepage and listing order.
          </p>
        </div>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="mr-2 size-4" /> New collection
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={onSearchChange}
            placeholder="Search collections…"
            className="pl-9"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setPagination((prev) => ({ ...prev, pageIndex: 1 }));
              }}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {!canReorder && (
        <p className="mb-3 text-sm text-amber-700">
          Clear search to reorder collections.
        </p>
      )}

      <DataTable
        columns={columns}
        data={rows}
        pageCount={totalPages || 1}
        loading={isLoading || isFetching}
        pagination={{ pageIndex, pageSize }}
        setPagination={setPagination}
        manualPagination
        showSelected={false}
        showPagination={false}
        customEmpty="No collections yet"
      />

      <div className="mt-7">
        <AdvancedPagination
          initialPage={pageIndex}
          isLoading={isLoading || isFetching}
          totalPages={totalPages}
          pageSize={pageSize}
          showPageSizeSelector
          onPageSizeChange={(s) =>
            setPagination((prev) => ({ ...prev, pageSize: s, pageIndex: 1 }))
          }
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, pageIndex: page }))
          }
        />
      </div>

      <ActionAlert
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Delete collection?"
        body={
          toDelete ? (
            <span>
              “{toDelete.title}” and its saved products will be permanently
              removed.
            </span>
          ) : (
            "This permanently removes the collection."
          )
        }
        actionText="Delete"
        loading={isDeleting}
        handleAction={handleConfirmDelete}
      />
    </div>
  );
};

export default CollectionsPage;
