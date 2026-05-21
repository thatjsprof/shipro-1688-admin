import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Tooltip } from "@/components/ui/tooltip";
import {
  buildListingPatch,
  ProductListingSwitchCell,
} from "@/components/pages/products/product-listing-switch-cell";
import { IProduct } from "@/interfaces/product.interface";
import ActionAlert from "@/components/ui/action-alert";
import { notify } from "@/lib/toast";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/services/product.service";
import { useAppSelector } from "@/store/hooks";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { formatNum } from "@/lib/utils";
import debounce from "lodash.debounce";
import { format } from "date-fns";
import { Eye, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

const getColumns = (
  onListingChange: (
    product: IProduct,
    field: "isMoment" | "pinTrending" | "archived",
    checked: boolean
  ) => void,
  onRequestDelete: (product: IProduct) => void,
  updatingId: string | null
): ColumnDef<IProduct>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const name = row.original.description;
        return (
          <div className="max-w-80 w-80">
            <Tooltip
              contentClassName="max-w-[15rem] py-3 bg-primary text-white"
              side="top"
              mobileVariant="popover"
              arrowClassName="fill-primary bg-primary"
              content={
                <div>
                  <p className="mb-1">{name}</p>
                </div>
              }
            >
              {name ? (
                <div className="text-nowrap h-8">
                  <div className="flex items-center gap-[0.6rem] h-full">
                    <p className="truncate">
                      <span>{name}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p>---</p>
              )}
            </Tooltip>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "images",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Images"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const images = row.original.images;
        return images.length > 0 ? (
          <div className="flex items-center gap-[0.5rem] text-nowrap h-8">
            {images.slice(0, 3).map((image) => {
              return image.type === "image" ? (
                <img
                  key={image.url}
                  src={image.url}
                  className="w-10 h-10 rounded-md border flex-shrink-0 object-cover object-top"
                />
              ) : (
                <></>
              );
            })}
            {images.length > 3 && (
              <span className="text-sm">+{images.length - 3} more</span>
            )}
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "priceRange",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Price"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const priceRange = row.original.priceRange ?? [];
        const amountYen = row.original.amountYen;
        return (
          <div className="w-32">
            {priceRange.length > 0 ? (
              (() => {
                const [min, max] = priceRange;
                return (
                  <div className="flex items-center gap-[0.5rem] text-nowrap h-8">
                    <p>¥{formatNum(min)}</p>
                    {max != null && max !== min && (
                      <>
                        <span>-</span>
                        <p>¥{formatNum(max)}</p>
                      </>
                    )}
                  </div>
                );
              })()
            ) : amountYen != null && amountYen > 0 ? (
              <div className="flex items-center text-nowrap h-8">
                <p>¥{formatNum(amountYen)}</p>
              </div>
            ) : (
              <p>---</p>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Date Created"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <div className="w-40 text-nowrap h-8 flex items-center">
            {createdAt ? (
              <p>{format(new Date(createdAt), "dd MMM, yyy, h:mm a")}</p>
            ) : (
              <p>---</p>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "isMoment",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Moment"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const isMoment = product.isMoment ?? false;
        const archived = product.archived ?? false;
        return (
          <ProductListingSwitchCell
            checked={isMoment}
            disabled={archived || updatingId === product.id}
            onCheckedChange={(checked) =>
              onListingChange(product, "isMoment", checked)
            }
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "pinTrending",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pinned"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const pinTrending = product.pinTrending ?? false;
        const isMoment = product.isMoment ?? false;
        const archived = product.archived ?? false;
        return (
          <ProductListingSwitchCell
            checked={pinTrending}
            disabled={!isMoment || archived || updatingId === product.id}
            onCheckedChange={(checked) =>
              onListingChange(product, "pinTrending", checked)
            }
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "soldOut",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Out of stock"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const soldOut = row.original.soldOut ?? false;
        return (
          <div className="w-24 text-nowrap h-8 flex items-center">
            <p>{soldOut ? "Yes" : "No"}</p>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "archived",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Archived"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const archived = product.archived ?? false;
        return (
          <ProductListingSwitchCell
            checked={archived}
            disabled={updatingId === product.id}
            onCheckedChange={(checked) =>
              onListingChange(product, "archived", checked)
            }
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "moq",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="MOQ"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const moq = row.original.moq;
        return (
          <div className="w-18">
            {moq > 0 ? (
              <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
                <p className="truncate">{moq}</p>
              </div>
            ) : (
              <p>---</p>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "company",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Company"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const company = row.original.company;
        return company ? (
          <div className="text-nowrap h-8 w-28">
            <div className="flex items-center gap-[0.6rem] h-full">
              <p>
                <span>{company}</span>
              </p>
            </div>
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title=""
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`${process.env.CLIENT_URL}/products/${product.id}`}
              target="_blank"
            >
              <Button type="button" variant="outline" className="shadow-none">
                <Eye />
                View
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="shadow-none text-destructive hover:text-destructive"
              onClick={() => onRequestDelete(product)}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
};

const Products = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const authenticated = useAppSelector((state) => state.user.authenticated);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const { data, isLoading } = useGetProductsQuery(
    {
      page: pageIndex - 1,
      limit: pageSize,
      search: debouncedValue,
      includeArchived: true,
    },
    {
      skip: !authenticated,
    }
  );
  const products = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);

  const handleListingChange = useCallback(
    async (
      product: IProduct,
      field: "isMoment" | "pinTrending" | "archived",
      checked: boolean
    ) => {
      setUpdatingId(product.id);
      try {
        const patch = buildListingPatch(product, field, checked);
        const res = await updateProduct({ id: product.id, data: patch }).unwrap();
        if (res.status !== 200) {
          notify(res.message ?? "Failed to update product", "error");
        }
      } catch {
        notify("Failed to update product", "error");
      } finally {
        setUpdatingId(null);
      }
    },
    [updateProduct]
  );

  const handleRequestDelete = useCallback((product: IProduct) => {
    setProductToDelete(product);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!productToDelete) return;
    try {
      const res = await deleteProduct(productToDelete.id).unwrap();
      if (res.status === 200) {
        notify(res.message ?? "Product deleted", "success");
        setDeleteOpen(false);
        setProductToDelete(null);
      } else {
        notify(res.message ?? "Failed to delete product", "error");
      }
    } catch {
      notify("Failed to delete product", "error");
    }
  }, [deleteProduct, productToDelete]);

  const columns = useMemo(
    () => getColumns(handleListingChange, handleRequestDelete, updatingId),
    [handleListingChange, handleRequestDelete, updatingId]
  );

  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedValue(value);
    }, 300),
    []
  );
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    debouncedChangeHandler(value);
  };

  const handleClearSearch = () => {
    setDebouncedValue("");
    setSearchValue("");
  };

  useEffect(() => {
    document.title = `Products | Shipro Africa`;
  }, []);

  return (
    <div className="mt-7">
      <div className="flex items-center gap-3 justify-between">
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder="Search Product(s)"
          className="h-11 pl-[3rem] !text-[1rem] placeholder:text-[.95rem]"
          StartIcon={<Search className="ml-2 text-gray-400 h-4 w-4" />}
          EndIcon={
            searchValue ? (
              <X
                className="text-gray-400 -mr-[.1rem] h-4 w-4 cursor-pointer"
                onClick={handleClearSearch}
              />
            ) : null
          }
        />
        <Link href="/products/new">
          <Button className="shadow-none h-11">Create New</Button>
        </Link>
      </div>
      <div className="grid grid-cols-12 mt-8">
        <DataTable
          columns={columns}
          data={products}
          pageCount={totalPages}
          manualPagination={true}
          manualFiltering={true}
          loading={isLoading}
          pagination={pagination}
          showSelected={false}
          setPagination={setPagination}
          showPagination={false}
          headerRowClassname="hover:bg-transparent"
          headerSubClassname="!px-0"
          customEmpty="No orders Found"
          wrapperCls="col-span-12 w-full"
          className="border-none rounded-none"
          cellStyles={{
            orderNumber: "w-[13rem]",
          }}
          rowClick={(product) => {
            router.push(`/products/${product.original.id}`);
          }}
        />
      </div>
      <ActionAlert
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Delete product?"
        body={
          productToDelete ? (
            <span>
              This permanently removes{" "}
              <strong className="font-medium">
                {productToDelete.description}
              </strong>
              . This cannot be undone.
            </span>
          ) : (
            "This permanently removes the product. This cannot be undone."
          )
        }
        actionText="Delete product"
        loading={isDeleting}
        handleAction={handleConfirmDelete}
        closeCls="shadow-none"
      />
      <div className="mt-7">
        <AdvancedPagination
          initialPage={pagination.pageIndex}
          isLoading={isLoading}
          totalPages={totalPages}
          showPageSizeSelector
          pageSize={pagination.pageSize}
          onPageSizeChange={(s) =>
            setPagination((prev) => ({
              ...prev,
              pageSize: s,
            }))
          }
          onPageChange={(page) => {
            setPagination((prev) => ({
              ...prev,
              pageIndex: page,
            }));
          }}
        />
      </div>
    </div>
  );
};

export default Products;
