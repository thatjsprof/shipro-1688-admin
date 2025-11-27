import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
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
    // {
    //   accessorKey: "trackingNumber",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title="Tracking Number"
    //       className="-mb-[1.8px] px-2"
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const trackingNumber = row.getValue<string>("trackingNumber");
    //     return trackingNumber ? (
    //       <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
    //         <Copy
    //           className="size-4"
    //           onClick={() =>
    //             copyToClipboard({
    //               id: "copy-tracking-number",
    //               text: trackingNumber,
    //               message: "Tracking number copied to clipboard",
    //             })
    //           }
    //         />
    //         <p>{trackingNumber}</p>
    //       </div>
    //     ) : (
    //       <p>---</p>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
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
        return name ? (
          <div className="text-nowrap h-8 w-64">
            <div className="flex items-center gap-[0.6rem] h-full">
              <p
                className="truncate"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewClick(row.original);
                }}
              >
                <span>{name}</span>
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
    // {
    //   accessorKey: "quantity",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title="Quantity"
    //       className="-mb-[1.8px] px-2"
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const itemsQuantity = row.original.items.reduce((acc, cur) => {
    //       return (acc += cur.quantity);
    //     }, 0);
    //     const quantity = itemsQuantity || row.original.quantity;
    //     return quantity > 0 ? (
    //       <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
    //         <p className="truncate">{quantity}</p>
    //       </div>
    //     ) : (
    //       <p>---</p>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: "orderAmount",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title="Order Amount"
    //       className="-mb-[1.8px] px-2"
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const orderAmount = row.getValue<string>("orderAmount");
    //     return parseFloat(orderAmount) > 0 ? (
    //       <div className="flex items-center gap-[0.6rem] text-nowrap">
    //         ₦{formatNum(orderAmount)}
    //       </div>
    //     ) : (
    //       <p>---</p>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: "packageWeight",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title="Package Weight"
    //       className="-mb-[1.8px] px-2"
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const packageWeight = row.getValue<string>("packageWeight");
    //     return packageWeight ? (
    //       <div className="flex items-center gap-[0.6rem] text-nowrap">
    //         {formatNum(packageWeight)}g
    //       </div>
    //     ) : (
    //       <p>---</p>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: "user",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title="Owner"
    //       className="-mb-[1.8px] px-2"
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const user = row.original.order.user.name;
    //     return (
    //       <div className="flex items-center gap-[0.6rem] text-nowrap">
    //         {user}
    //       </div>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: "createdAt",
    //   header: ({ column }) => {
    //     return (
    //       <DataTableColumnHeader
    //         column={column}
    //         title="Date Ordered"
    //         className="-mb-[1.8px] px-2"
    //       />
    //     );
    //   },
    //   cell: ({ row }) => {
    //     const createdAt = row.getValue<Date>("createdAt");
    //     return (
    //       <div className="flex items-center gap-[0.9rem] text-nowrap">
    //         {createdAt ? format(createdAt, "dd MMM, yyy, h:mm a") : "---"}
    //       </div>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: "status",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title="Status"
    //       className="-mb-[1.8px] px-2"
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const status = row.getValue<OrderStatus>("status");
    //     const statusInfo = orderStatusInfo[status];
    //     const IconComponent = LucideIcons[
    //       statusInfo?.icon as LucideIconName
    //     ] as LucideIcons.LucideIcon;

    //     return (
    //       <div
    //         className="rounded-full flex items-center gap-2 px-[10px] py-[6px] text-[.82rem] w-fit font-medium"
    //         style={{
    //           backgroundColor: statusInfo?.bgColor,
    //           color: statusInfo?.color ?? "#fff",
    //         }}
    //       >
    //         <IconComponent className="size-4" />
    //         {statusInfo?.text}
    //       </div>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: "actions",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title=""
    //       className="-mb-[1.8px] px-2"
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex items-center gap-[0.6rem] text-nowrap">
    //         <Button
    //           variant="outline"
    //           className="shadow-none"
    //           onClick={() => {
    //             onUpdateClick(row.original);
    //           }}
    //         >
    //           <LucideIcons.Pencil className="size-4" />
    //         </Button>
    //         <Button
    //           className="bg-secondary hover:bg-secondary"
    //           onClick={() => onPaymentClick(row.original)}
    //         >
    //           <LucideIcons.BanknoteArrowUp className="size-5" />
    //         </Button>
    //       </div>
    //     );
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
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
