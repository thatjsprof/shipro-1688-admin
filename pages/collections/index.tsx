import ActionAlert from "@/components/ui/action-alert";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { ICollection } from "@/interfaces/collection.interface";
import { notify } from "@/lib/toast";
import {
  useDeleteCollectionMutation,
  useGetCollectionsQuery,
  useUpdateCollectionMutation,
} from "@/services/collection.service";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

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

  const { data, isLoading, isFetching } = useGetCollectionsQuery({
    page: pageIndex - 1,
    limit: pageSize,
    search: debouncedSearch,
  });
  const [updateCollection] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] =
    useDeleteCollectionMutation();

  const collections = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 0;

  useEffect(() => {
    document.title = "Collections | Shipro Africa";
  }, []);

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

  const columns = useMemo<ColumnDef<ICollection>[]>(
    () => [
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
              src={cover}
              alt=""
              className="h-12 w-16 rounded object-cover"
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
    [handleToggleActive, router]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Collections</h1>
          <p className="text-sm text-zinc-500">
            Curate Shipro and 1688 products into shareable collections
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

      <DataTable
        columns={columns}
        data={collections}
        pageCount={totalPages || 1}
        loading={isLoading || isFetching}
        pagination={{ pageIndex, pageSize }}
        setPagination={setPagination}
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
