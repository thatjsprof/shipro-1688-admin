import PurchaseSheet from "@/components/pages/rmb/rmb-sheet";
import { PaymentStatusPill } from "@/components/shared/status-pill";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Tooltip } from "@/components/ui/tooltip";
import { PurchaseStatus, type RMBPurchase } from "@/interfaces/rmb.interface";
import { paymentStatus } from "@/lib/constants";
import useCopy, { ICopy } from "@/lib/copy";
import { notify } from "@/lib/toast";
import { formatNum } from "@/lib/utils";
import {
  useGetOrdersQuery,
  useUpdateOrderMutation,
} from "@/services/rmb.service";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { Copy, Eye, Search, X } from "lucide-react";
import { ChangeEvent, useCallback, useState, useEffect } from "react";

const getColumns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void,
  onUpdate: (rmb: RMBPurchase, newStatus: PurchaseStatus) => void,
  onViewClick: (rmb: RMBPurchase) => void,
  localStatuses: Record<string, PurchaseStatus>,
  setLocalStatuses: React.Dispatch<
    React.SetStateAction<Record<string, PurchaseStatus>>
  >
): ColumnDef<RMBPurchase>[] => {
  return [
    {
      accessorKey: "reference",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Reference"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const reference = row.getValue<string>("reference");
        return reference ? (
          <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
            <Copy
              className="size-4"
              onClick={(e) => {
                copyToClipboard({
                  id: "copy-tracking-number",
                  text: reference,
                  message: "Reference copied to clipboard",
                });
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <p>{reference}</p>
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "details",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const description = row.original.description;
        return description ? (
          <div className="text-nowrap h-8">
            <div className="flex items-center gap-[0.6rem] h-full">
              <Tooltip
                contentClassName="max-w-[15rem] py-3 bg-primary text-white"
                side="top"
                arrowClassName="bg-primary"
                mobileVariant="popover"
                content={
                  <div>
                    <p className="mb-1">{description}</p>
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
                  <Eye className="size-4 flex-shrink-0 inline-block -mt-[3px] mr-2" />
                  <span>{description}</span>
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
      accessorKey: "rmbAmount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Rmb Amount"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const rmbAmount = row.getValue<string>("rmbAmount");
        return parseFloat(rmbAmount) > 0 ? (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            {formatNum(rmbAmount)} RMB
          </div>
        ) : (
          <p>---</p>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "aliPayQRcode",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="QR Code"
          className="-mb-[1.8px] px-2"
        />
      ),
      cell: ({ row }) => {
        const qrCode = row.original.details.aliPayQRcode;
        return (
          <img
            src={qrCode}
            alt={`Qr code ${row.original.id}`}
            className="w-10 h-10 rounded-md border flex-shrink-0 object-cover object-top"
          />
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
        const user = row.original.user.name;
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
      accessorKey: "datePaid",
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
        const datePaid = row.getValue<Date>("datePaid");
        return (
          <div className="flex items-center gap-[0.9rem] text-nowrap">
            {datePaid ? format(datePaid, "dd MMM, yyy, h:mm a") : "---"}
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
        const status = row.getValue<PurchaseStatus>("status");

        return (
          <div className="flex items-center gap-[0.9rem] text-nowrap capitalize">
            <PaymentStatusPill status={status} />
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
        const currentStatus =
          localStatuses[row.original.id] || row.original.status;

        return (
          <div className="flex items-center gap-[0.6rem] text-nowrap">
            <Select
              value={currentStatus}
              onValueChange={(value: PurchaseStatus) => {
                setLocalStatuses((prev) => ({
                  ...prev,
                  [row.original.id]: value,
                }));
                onUpdate(row.original, value);
              }}
            >
              <SelectTrigger iconClassname="ml-3">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PurchaseStatus).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {paymentStatus[value] ?? value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
};

const RMBPurchase = () => {
  const { copyToClipboard } = useCopy();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [order, setOrder] = useState<RMBPurchase | null>(null);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [localStatuses, setLocalStatuses] = useState<
    Record<string, PurchaseStatus>
  >({});
  const [statuses, setStatuses] = useState<
    { value: PurchaseStatus; label: string }[]
  >([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const [updateOrder] = useUpdateOrderMutation();
  const { data, isLoading, isFetching } = useGetOrdersQuery({
    limit: pagination.pageSize,
    page: pagination.pageIndex - 1,
    statuses: statuses.map((s) => s.value),
    search: debouncedValue,
  });
  const purchases = data?.data.data || [];
  const totalPages = data?.data.totalPages || 0;

  useEffect(() => {
    setLocalStatuses({});
  }, [data]);

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

  const handleStatusUpdate = async (
    order: RMBPurchase,
    newStatus: PurchaseStatus
  ) => {
    try {
      const response = await updateOrder({
        id: order?.id,
        data: {
          status: newStatus,
        },
      }).unwrap();
      if (response.status === 200) {
        notify(response.message, "success");
      } else {
        notify(response.message, "error");
      }
    } catch (err) {
      notify("Could not update status", "error");
      console.error(err);
    }
  };

  return (
    <div className="mt-7">
      <div className="flex items-center gap-3 justify-between">
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder="Search Purchase(s)"
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
        <MultiSelect<PurchaseStatus>
          options={Object.entries(PurchaseStatus).map(([key, value]) => ({
            value,
            label: paymentStatus[value] ?? "",
          }))}
          selected={statuses}
          onChange={(values) => setStatuses(values)}
          placeholder="Select statuses"
        />
      </div>
      <div className="grid grid-cols-12 mt-8">
        <DataTable
          columns={getColumns(
            copyToClipboard,
            handleStatusUpdate,
            (rmb) => {
              setOrder(rmb);
              setOpenSheet(true);
            },
            localStatuses,
            setLocalStatuses
          )}
          data={purchases}
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
      <PurchaseSheet
        open={openSheet}
        onOpenChange={setOpenSheet}
        purchase={order!}
      />
    </div>
  );
};

export default RMBPurchase;
