import AdvancedPagination from "@/components/ui/advanced-pagination";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IOrderItem, OrderStatus } from "@/interfaces/order.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Copy, Search } from "lucide-react";
import { useCallback, ChangeEvent, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { formatNum } from "@/lib/utils";
import { orderStatusInfo } from "@/lib/constants";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/router";
import { useGetOrderItemsQuery } from "@/services/order.service";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "@/components/pages/order/payment-dialog";
import { PaymentFormData } from "@/schemas/payment";
import { notify } from "@/lib/toast";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderDialog from "@/components/pages/order/order-dialog";
import OrderSheet from "@/components/pages/order/order-sheet";
import { Icons } from "@/components/shared/icons";
type LucideIconName = keyof typeof LucideIcons;

// id: string;
//   // product: IProduct;
//   variants: Record<string, any>;
//   quantity: number;
//   trackingNumber: string;
//   tags: string[];
//   packageWeight: number;
//   totalWeight: number;
//   orderAmount: number;
//   arrivedWarehouse: Date;
//   order: IOrder;
//   name: string;
//   images: string[];
//   category: string;
//   timeArrivedInWarehouse: Date;
//   note: string;
//   items: {
//     type: "picture" | "link";
//     quantity: number;
//     pictures?: {
//       filename: string;
//       key: string;
//       url: string;
//     }[];
//     link?: string;
//     note?: string;
//   }[];
//   shipmentOrder: IOrder;
//   payments: IPayment[];
//   status: OrderStatus;

const getColumns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void,
  onPaymentClick: (orderItem: IOrderItem) => void,
  onViewClick: (item: IOrderItem) => void,
  onUpdateClick: (item: IOrderItem) => void
): ColumnDef<IOrderItem>[] => {
  return [
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
        const trackingNumber = row.getValue<string>("trackingNumber");
        return trackingNumber ? (
          <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
            <Copy
              className="size-4"
              onClick={() =>
                copyToClipboard({
                  id: "copy-tracking-number",
                  text: trackingNumber,
                  message: "Tracking number copied to clipboard",
                })
              }
            />
            <p>{trackingNumber}</p>
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
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
        const name = row.original.name ?? row.original.product.description;
        return name ? (
          <div className="text-nowrap h-8 w-64">
            <div className="flex items-center gap-[0.6rem] h-full">
              <p
                className="truncate hover:text-secondary duration-200 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewClick(row.original);
                }}
              >
                <LucideIcons.Eye className="size-4 flex-shrink-0 inline-block -mt-[3px] mr-2" />
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
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Quantity"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const itemsQuantity = row.original.items.reduce((acc, cur) => {
          return (acc += cur.quantity);
        }, 0);
        const quantity = itemsQuantity || row.original.quantity;
        return quantity > 0 ? (
          <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
            <p className="truncate">{quantity}</p>
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
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
        return parseFloat(orderAmount) > 0 ? (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            ₦{formatNum(orderAmount)}
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "packageWeight",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Package Weight"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const packageWeight = row.getValue<string>("packageWeight");
        return packageWeight ? (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            {formatNum(packageWeight)}g
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Owner"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const user = row.original.order.user.name;
        return (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            {user}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Date Ordered"
            className="-mb-[1.8px] px-2"
          />
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue<Date>("createdAt");
        return (
          <div className="flex items-center gap-[0.9rem] text-nowrap">
            {createdAt ? format(createdAt, "dd MMM, yyy, h:mm a") : "---"}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
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
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            <Button
              variant="outline"
              className="shadow-none"
              onClick={() => {
                onUpdateClick(row.original);
              }}
            >
              <LucideIcons.Pencil className="size-4" />
            </Button>
            <Button
              className="bg-secondary hover:bg-secondary"
              onClick={() => onPaymentClick(row.original)}
            >
              <LucideIcons.BanknoteArrowUp className="size-5" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
};

interface OrdersTableProps {
  searchValue: string;
  statuses: {
    value: OrderStatus;
    label: string;
  }[];
}

const OrdersTable = ({ searchValue, statuses }: OrdersTableProps) => {
  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const [order, setOrder] = useState<IOrderItem | null>(null);
  const [orderUpdate, setOrderUpdate] = useState<IOrderItem[]>([]);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [rowSelection, setRowSelection] = useState<IOrderItem[]>([]);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [selectedOrderItem, setSelectedOrderItem] = useState<IOrderItem | null>(
    null
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handlePaymentClick = (orderItem: IOrderItem) => {
    setSelectedOrderItem(orderItem);
    setIsPaymentDialogOpen(true);
  };

  const columns = getColumns(
    copyToClipboard,
    handlePaymentClick,
    (item: IOrderItem) => {
      setOpenSheet(true);
      setOrder(item);
    },
    (item: IOrderItem) => {
      setOpenUpdate(true);
      setOrderUpdate([item]);
    }
  );

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!selectedOrderItem) return;

    setIsSubmittingPayment(true);
    try {
      notify("Payment created successfully", "success");
      setIsPaymentDialogOpen(false);
      setSelectedOrderItem(null);
    } catch (error: any) {
      notify(error?.message || "Failed to create payment", "error");
    } finally {
      setIsSubmittingPayment(false);
    }
  };
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const {
    data: orderItems,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrderItemsQuery({
    search: searchValue,
    page: pageIndex - 1,
    limit: pageSize,
    statuses: statuses.map((s) => s.value),
  });

  const handleRefresh = async () => {
    setPagination({
      pageIndex: 1,
      pageSize: 10,
    });
    await refetch().unwrap();
  };

  const orders = orderItems?.data.data ?? [];
  const totalPages = orderItems?.data.totalPages ?? 0;
  const hasSelected = rowSelection.length > 0;

  return (
    <div>
      <div className="flex justify-end gap-2 mt-4 mb-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shadow-none">
              <LucideIcons.Settings />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuItem
              disabled={!hasSelected}
              onClick={() => {
                setOpenUpdate(true);
                setOrderUpdate(rowSelection);
              }}
            >
              Update
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!hasSelected}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!hasSelected}>
              Send Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="shadow-none w-12"
          disabled={isFetching}
        >
          {isFetching ? (
            <Icons.spinner className="h-5 w-5 animate-spin" />
          ) : (
            <LucideIcons.RefreshCcw className="size-5" />
          )}
        </Button>
      </div>
      <div className="grid grid-cols-12">
        <DataTable
          columns={columns}
          data={orders}
          getRowId={(row) => row.id}
          pageCount={totalPages}
          manualPagination={true}
          manualFiltering={true}
          loading={isLoading || isFetching}
          pagination={pagination}
          showSelected={false}
          setPagination={setPagination}
          showPagination={false}
          enableRowSelection
          onSelectedRowsChange={setRowSelection}
          headerRowClassname="hover:bg-transparent"
          headerSubClassname="!px-0"
          customEmpty="No orders Found"
          wrapperCls="col-span-12 w-full"
          className="border-none rounded-none"
          cellStyles={{
            orderNumber: "w-[13rem]",
          }}
          rowClickSelectsCheckbox
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
      <OrderDialog
        open={openUpdate}
        onOpenChange={setOpenUpdate}
        orders={orderUpdate!}
      />
      <OrderSheet open={openSheet} onOpenChange={setOpenSheet} item={order!} />
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSubmit={handlePaymentSubmit}
        isLoading={isSubmittingPayment}
      />
    </div>
  );
};

const Orders = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [statuses, setStatuses] = useState<
    { value: OrderStatus; label: string }[]
  >([]);

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

  return (
    <div className="flex flex-col gap-8 mt-7">
      <div className="flex items-center gap-2 mb-0">
        <Input
          value={searchValue}
          onChange={handleChange}
          className="h-11 pl-[3rem] !text-[1rem] placeholder:text-[.95rem]"
          placeholder="Search order item(s)"
          StartIcon={<Search className="ml-2 text-gray-400 size-4" />}
        />
        <MultiSelect<OrderStatus>
          options={Object.values(OrderStatus).map((status) => ({
            value: status,
            label: orderStatusInfo[status]?.text ?? "",
          }))}
          selected={statuses}
          onChange={setStatuses}
          className="h-11"
          placeholder="Select order statuses"
        />
      </div>
      <OrdersTable searchValue={debouncedValue} statuses={statuses} />
    </div>
  );
};

export default Orders;
