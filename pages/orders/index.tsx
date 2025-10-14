import AdvancedPagination from "@/components/ui/advanced-pagination";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IOrder, IOrderItem, OrderStatus } from "@/interfaces/order.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Copy, Search } from "lucide-react";
import { useCallback, ChangeEvent, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { useGetOrdersQuery } from "@/services/order.service";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { formatNum } from "@/lib/utils";
import { orderStatusInfo } from "@/lib/constants";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/router";
type LucideIconName = keyof typeof LucideIcons;

const getBaseColumns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void
): Record<string, ColumnDef<IOrder>> => {
  return {
    orderNumber: {
      accessorKey: "orderNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Order Number"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const orderNumber = row.getValue<string>("orderNumber");
        return (
          <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
            <Copy
              className="size-4"
              onClick={() =>
                copyToClipboard({
                  id: "copy-order-number",
                  text: orderNumber,
                  message: "Order number copied to clipboard",
                })
              }
            />
            <p>{orderNumber}</p>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    orderAmount: {
      accessorKey: "orderAmount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Order Amount"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const orderAmount = row.getValue<string>("orderAmount");
        return (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            ₦{formatNum(orderAmount)}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    items: {
      accessorKey: "items",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Items"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const items = row.getValue<IOrderItem[]>("items");
        console.log(items);
        return (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            {items.length} Item(s)
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    totalWeight: {
      accessorKey: "totalWeight",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Order Amount"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const totalWeight = row.getValue<string>("totalWeight");
        return (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            {formatNum(totalWeight)}g
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    actualWeight: {
      accessorKey: "packageWeight",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Actual Weight"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const packageWeight = row.getValue<string>("packageWeight");
        return (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            {packageWeight ? formatNum(packageWeight) : "N/A"}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    status: {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const status = row.getValue<OrderStatus>("status");
        const statusInfo = orderStatusInfo[status];
        const IconComponent = LucideIcons[
          statusInfo?.icon as LucideIconName
        ] as LucideIcons.LucideIcon;

        return (
          <div
            className="rounded-full flex items-center gap-2 px-[10px] py-[6px] text-[.82rem] w-fit font-medium"
            style={{
              backgroundColor: statusInfo?.bgColor,
              color: statusInfo?.color ?? "#fff",
            }}
          >
            <IconComponent className="size-4" />
            {statusInfo?.text}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  };
};

const getColumns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void
): Record<string, ColumnDef<IOrder>[]> => {
  const allBaseColumns = Object.values(getBaseColumns(copyToClipboard));
  return {
    placed: [...allBaseColumns],
    shipped: [
      ...allBaseColumns,
      {
        accessorKey: "trackingNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Tracking Number"
            className="-mb-[1.8px] px-2"
          />
        ),
        cell: ({ row }) => {
          const tracking = row.getValue<string>("trackingNumber");
          return <div className="text-nowrap">{tracking || "---"}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
  };
};

interface TabConfig {
  value: string;
  label: string;
  status: OrderStatus;
  columns?: ColumnDef<IOrder>[];
}

const tabConfigs: TabConfig[] = [
  {
    value: "placed",
    label: "Placed",
    status: OrderStatus.PLACED,
  },
  {
    value: "processing",
    label: "Processing",
    status: OrderStatus.PROCESSING,
  },
  {
    value: "shipped",
    label: "Shipped",
    status: OrderStatus.SHIPPED,
  },
  {
    value: "out_for_delivery",
    label: "Out For Delivery",
    status: OrderStatus.OUT_FOR_DELIVERY,
  },
  {
    value: "delivered",
    label: "Delivered",
    status: OrderStatus.DELIVERED,
  },
];

interface OrdersTableProps {
  status: OrderStatus;
  searchValue: string;
  columns: ColumnDef<IOrder>[];
}

const OrdersTable = ({ status, searchValue, columns }: OrdersTableProps) => {
  const router = useRouter();
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

  const {
    data: res,
    isLoading,
    isFetching,
  } = useGetOrdersQuery({
    statuses: [status],
    search: searchValue,
    page: pageIndex - 1,
    limit: pageSize,
  });

  const data = res?.data;
  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <>
      <DataTable
        columns={columns}
        data={orders}
        pageCount={totalPages}
        manualPagination={true}
        manualFiltering={true}
        loading={isLoading || isFetching}
        pagination={pagination}
        showSelected={false}
        setPagination={setPagination}
        showPagination={false}
        headerRowClassname="hover:bg-transparent"
        headerSubClassname="!px-0"
        customEmpty="No orders Found"
        className="border-none rounded-none"
        cellStyles={{
          orderNumber: "w-[13rem]",
        }}
        rowClick={(item) => {
          router.push(`/orders/${item.original.id}`);
        }}
      />
      <div className="mt-7">
        <AdvancedPagination
          initialPage={pagination.pageIndex}
          isLoading={isLoading || isFetching}
          totalPages={totalPages}
          onPageChange={(page) => {
            setPagination((prev) => ({
              ...prev,
              pageIndex: page,
            }));
          }}
        />
      </div>
    </>
  );
};

const Orders = () => {
  const { copyToClipboard } = useCopy();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [activeTab, setActiveTab] = useState("placed");

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

  const getColumnsForTab = (tabValue: string) => {
    const columns = getColumns(copyToClipboard);
    return columns[tabValue] || [];
  };

  return (
    <div className="flex flex-col gap-8 mt-7">
      <div className="flex items-center gap-2 mb-0">
        <Input
          value={searchValue}
          onChange={handleChange}
          className="h-11 pl-[3rem] !text-[1rem] placeholder:text-[.95rem]"
          placeholder="Search order(s)"
          StartIcon={<Search className="ml-2 text-gray-400 size-4" />}
        />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabConfigs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabConfigs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="pt-3">
            <OrdersTable
              status={tab.status}
              searchValue={debouncedValue}
              columns={getColumnsForTab(tab.value)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Orders;
