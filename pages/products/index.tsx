import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Tooltip } from "@/components/ui/tooltip";
import { IProduct } from "@/interfaces/product.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { useGetProductsQuery } from "@/services/product.service";
import { useAppSelector } from "@/store/hooks";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import debounce from "lodash.debounce";
import { Eye, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useMemo, useState } from "react";

const getColumns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void,
  onViewClick: (row: IProduct) => void
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
          <div className="w-110">
            <Tooltip
              contentClassName="max-w-[15rem] py-3 bg-primary text-white"
              side="top"
              mobileVariant="popover"
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
                  className="w-10 h-10 rounded-md border flex-shrink-0"
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
          title="Price Range"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const priceRange = row.original.priceRange ?? [];
        return (
          <div className="w-32">
            {priceRange.length > 0 ? (
              (() => {
                const [min, max] = priceRange;
                return (
                  <div className="flex items-center gap-[0.5rem] text-nowrap h-8">
                    <p>¥{min}</p>
                    {max && (
                      <>
                        <span>-</span>
                        <p>¥{max}</p>
                      </>
                    )}
                  </div>
                );
              })()
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
        return (
          <div>
            <Link
              href={`${process.env.CLIENT_URL}/products/${row.original.id}`}
              target="_blank"
            >
              <Button className="shadow-none">
                <Eye />
                View
              </Button>
            </Link>
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
  const { copyToClipboard } = useCopy();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const authenticated = useAppSelector((state) => state.user.authenticated);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 10,
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
    },
    {
      skip: !authenticated,
    }
  );
  const products = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 0;

  const columns = getColumns(copyToClipboard, () => null);

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
      <div className="mt-7">
        <AdvancedPagination
          initialPage={pagination.pageIndex}
          isLoading={false}
          totalPages={totalPages}
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
