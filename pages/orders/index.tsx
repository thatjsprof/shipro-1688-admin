import AdvancedPagination from "@/components/ui/advanced-pagination";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IOrderItem, OrderStatus } from "@/interfaces/order.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Copy, Search } from "lucide-react";
import {
  useCallback,
  ChangeEvent,
  useMemo,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import debounce from "lodash.debounce";
import { cn, formatNum, upperCaseFirst } from "@/lib/utils";
import { orderStatusInfo } from "@/lib/constants";
import * as LucideIcons from "lucide-react";
import { useGetOrderItemsQuery } from "@/services/order.service";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "@/components/pages/order/payment-dialog";
import { PaymentAltFormData } from "@/schemas/payment";
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
import MultiKeywordInput from "@/components/ui/multi-keyword";
import { Tooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import OrderEmailsDialog from "@/components/pages/order/order-emails";
import ShipmentDialog from "@/components/pages/order/shipment-dialog";
type LucideIconName = keyof typeof LucideIcons;

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
              onClick={(e) => {
                copyToClipboard({
                  id: "copy-tracking-number",
                  text: trackingNumber,
                  message: "Tracking number copied to clipboard",
                });
                e.preventDefault();
                e.stopPropagation();
              }}
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
              <Tooltip
                contentClassName="max-w-[15rem] py-3 bg-primary text-white"
                side="top"
                arrowClassName="bg-primary"
                mobileVariant="popover"
                content={
                  <div>
                    <p className="mb-1">{name}</p>
                  </div>
                }
              >
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
              </Tooltip>
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
            {formatNum(packageWeight)}kg
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
      accessorKey: "dateOrdered",
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
        const dateOrdered = row.getValue<Date>("dateOrdered");
        return (
          <div className="flex items-center gap-[0.9rem] text-nowrap">
            {dateOrdered ? format(dateOrdered, "dd MMM, yyy, h:mm a") : "---"}
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

        return IconComponent ? (
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
        ) : (
          <div>---</div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Tags"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const tags = row.original.tags ?? [];
        return tags.length > 0 ? (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            {tags.map((t) => {
              return (
                <Badge
                  key={t}
                  className={cn(
                    "h-8 rounded-full px-4",
                    tags.includes("sensitive") &&
                      "bg-yellow-500/10 text-destructive text-sm"
                  )}
                >
                  {upperCaseFirst(t)}
                </Badge>
              );
            })}
          </div>
        ) : (
          <div>---</div>
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
  keywords: string[];
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  pagination: PaginationState;
  setRowSelect: Dispatch<SetStateAction<Record<string, boolean>>>;
  rowSelection: IOrderItem[];
  setRowSelection: Dispatch<SetStateAction<IOrderItem[]>>;
  rowSelect: Record<string, boolean>;
}

const OrdersTable = ({
  searchValue,
  statuses,
  pagination: { pageIndex, pageSize },
  setPagination,
  rowSelection,
  setRowSelection,
  setRowSelect,
  rowSelect,
  keywords,
}: OrdersTableProps) => {
  const { copyToClipboard } = useCopy();
  const [order, setOrder] = useState<IOrderItem | null>(null);
  const [orderUpdate, setOrderUpdate] = useState<IOrderItem[]>([]);
  const [orderShipment, setOrderShipment] = useState<IOrderItem[]>([]);
  const [orderEmails, setOrderEmails] = useState<IOrderItem[]>([]);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [openShipment, setOpenShipment] = useState<boolean>(false);
  const [openEmails, setOpenEmails] = useState<boolean>(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<IOrderItem | null>(
    null
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handlePaymentClick = (orderItem: IOrderItem) => {
    setSelectedOrderItem(orderItem);
    setIsPaymentDialogOpen(true);
  };

  const clearState = () => {
    setRowSelection([]);
    setRowSelect({});
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

  const handlePaymentSubmit = async (data: PaymentAltFormData) => {
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
    search: (searchValue ? [searchValue] : keywords) ?? [],
    page: pageIndex - 1,
    limit: pageSize,
    statuses: statuses.map((s) => s.value),
  });

  const handleRefresh = async () => {
    setPagination({
      pageIndex: 1,
      pageSize: 20,
    });
    await refetch().unwrap();
  };

  const orders = orderItems?.data.data ?? [];
  const totalPages = orderItems?.data.totalPages ?? 0;
  const hasSelected = rowSelection.length > 0;
  const hasWarehouseItems = rowSelection.some(
    (item) => item.status === OrderStatus.AT_WAREHOUSE
  );

  const getRowId = useCallback((row: IOrderItem) => {
    return row.id.toString();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mt-4 mb-5">
        {hasSelected && (
          <div className="flex items-center gap-2">
            <p className="text-sm">{rowSelection.length} items selected</p>
            <Button
              className="shadow-none"
              variant="outline"
              onClick={clearState}
            >
              Clear Selected
            </Button>
          </div>
        )}
        <div className="flex justify-end gap-2 items-end ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shadow-none">
                <LucideIcons.Settings />
                <span className="hidden sm:inline-block">Actions</span>
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
                onClick={() => {
                  setOpenEmails(true);
                  setOrderEmails(rowSelection);
                }}
              >
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!hasSelected || !hasWarehouseItems}
                onClick={() => {
                  setOpenShipment(true);
                  setOrderShipment(rowSelection);
                }}
              >
                Create Shipment
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!hasSelected}
                className="text-destructive"
              >
                Delete
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
      </div>
      <div className="grid grid-cols-12">
        <DataTable
          columns={columns}
          data={orders}
          getRowId={getRowId}
          pageCount={totalPages}
          manualPagination={true}
          manualFiltering={true}
          loading={isLoading || isFetching}
          pagination={pagination}
          showSelected={false}
          rowSelection={rowSelect}
          setRowSelection={setRowSelect}
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
          isLoading={isLoading || isFetching}
          totalPages={totalPages}
          showPageSizeSelector
          pageSize={pagination.pageSize}
          onPageSizeChange={(s) =>
            setPagination((prev) => ({
              ...prev,
              pageIndex: 1,
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
      <OrderDialog
        open={openUpdate}
        onOpenChange={setOpenUpdate}
        orders={orderUpdate!}
        clearState={clearState}
      />
      <OrderEmailsDialog
        open={openEmails}
        orders={orderEmails!}
        onOpenChange={setOpenEmails}
      />
      <OrderSheet open={openSheet} onOpenChange={setOpenSheet} item={order!} />
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSubmit={handlePaymentSubmit}
        isLoading={isSubmittingPayment}
      />
      <ShipmentDialog
        open={openShipment}
        onOpenChange={setOpenShipment}
        orders={orderShipment}
        clearState={clearState}
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const [rowSelect, setRowSelect] = useState<Record<string, boolean>>({});
  const [rowSelection, setRowSelection] = useState<IOrderItem[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [multiKeywordMode, setMultiKeywordMode] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);

  const clearState = () => {
    setRowSelection([]);
    setRowSelect({});
  };

  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedValue(value);
      setRowSelect({});
    }, 300),
    []
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    debouncedChangeHandler(value);
  };

  const toggleMode = () => {
    setMultiKeywordMode((prev) => !prev);
    setSearchValue("");
    setKeywords([]);
    setSearchKeywords([]);
  };

  const handleSearch = () => {
    setSearchKeywords(keywords);
    clearState();
    setPagination({
      pageIndex: 1,
      pageSize: 10,
    });
  };

  useEffect(() => {
    if (
      multiKeywordMode &&
      searchKeywords.length > 0 &&
      keywords.length === 0
    ) {
      setSearchKeywords(keywords);
      clearState();
    }
  }, [keywords, multiKeywordMode, searchKeywords.length]);

  useEffect(() => {
    document.title = `Orders | Shipro Africa`;
  }, []);

  return (
    <div className="flex flex-col gap-8 mt-7">
      <div className="flex items-start gap-2 mb-0">
        <Tooltip
          contentClassName="max-w-[15rem] py-3 bg-primary text-white"
          side="top"
          mobileVariant="popover"
          content={
            <p className="font-medium">
              {multiKeywordMode
                ? "Switch to Single-Keyword Mode"
                : "Switch to Multi-Keyword Mode"}
            </p>
          }
        >
          <Button
            onClick={toggleMode}
            variant="outline"
            size="icon"
            className="h-11 w-11 shadow-none border-zinc-300"
          >
            {multiKeywordMode ? (
              <Search className="h-5 w-5" />
            ) : (
              <LucideIcons.List className="h-5 w-5" />
            )}
          </Button>
        </Tooltip>
        <MultiKeywordInput
          value={searchValue}
          onChange={handleChange}
          placeholder={
            multiKeywordMode
              ? "Type keyword and press Enter..."
              : "Search order item(s)"
          }
          keywords={keywords}
          isSearched={searchKeywords.length === keywords.length}
          onKeywordsChange={setKeywords}
          multiKeywordMode={multiKeywordMode}
          onModeToggle={() => setMultiKeywordMode(!multiKeywordMode)}
          className="!text-[1rem] placeholder:text-[.95rem]"
        />
        {multiKeywordMode && (
          <Button
            onClick={handleSearch}
            className="h-11 shadow-none"
            disabled={keywords.length === 0}
          >
            <Search className="h-5 w-5" />
            Search
          </Button>
        )}
        <MultiSelect<OrderStatus>
          options={Object.values(OrderStatus).map((status) => ({
            value: status,
            label: orderStatusInfo[status]?.text ?? "",
          }))}
          selected={statuses}
          onChange={(statuses) => {
            clearState();
            setPagination({
              pageIndex: 1,
              pageSize: 10,
            });
            setStatuses(statuses);
          }}
          className="h-11 border-zinc-300"
          placeholder="Select order statuses"
        />
      </div>
      <OrdersTable
        statuses={statuses}
        rowSelect={rowSelect}
        pagination={pagination}
        rowSelection={rowSelection}
        setRowSelect={setRowSelect}
        searchValue={debouncedValue}
        setPagination={setPagination}
        setRowSelection={setRowSelection}
        keywords={multiKeywordMode ? searchKeywords : keywords}
      />
    </div>
  );
};

export default Orders;
