import MetricPill from "@/components/shared/metric-pill";
import { PaymentStatusPill } from "@/components/shared/status-pill";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IPayment, PaymentStatus } from "@/interfaces/payment.interface";
import { paymentStatus } from "@/lib/constants";
import useCopy, { ICopy } from "@/lib/copy";
import { formatNum } from "@/lib/utils";
import {
  useGetAllPaymentsQuery,
  useGetPaymentSumsQuery,
} from "@/services/payment.service";
import { useAppSelector } from "@/store/hooks";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { ClockArrowUp, Copy, Search, Wallet, X } from "lucide-react";
import Link from "next/link";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
const columns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void
): ColumnDef<IPayment>[] => [
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
      return (
        <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
          <Copy
            className="size-5"
            onClick={() =>
              copyToClipboard({
                id: "copy-payment-reference",
                text: reference,
                message: "Payment reference copied to clipboard",
              })
            }
          />
          <p>{reference}</p>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Description"
        className="-mb-[1.8px] px-2"
      />
    ),
    cell: ({ row }) => {
      const description = row.getValue<string>("description");
      return (
        <div className="flex items-center gap-[0.6rem] text-nowrap">
          {description}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
        className="-mb-[1.8px] px-2"
      />
    ),
    cell: ({ row }) => {
      const baseAmount = row.original.baseAmount;
      return (
        <div className="flex items-center gap-[0.6rem] text-nowrap">
          ₦{formatNum(baseAmount)}
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
      const status = row.getValue<PaymentStatus>("status");
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
    accessorKey: "provider",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Provider"
        className="-mb-[1.8px] px-2"
      />
    ),
    cell: ({ row }) => {
      const provider = row.getValue<PaymentStatus>("provider");
      return (
        <div className="flex items-center gap-[0.9rem] text-nowrap capitalize">
          {provider}
        </div>
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
      const user = row.original.user;
      return (
        <div className="flex items-center gap-[0.6rem] text-nowrap">
          {user?.name}
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
          title="Date Paid"
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
  // {
  //   accessorKey: "actions",
  //   header: ({ column }) => {
  //     return (
  //       <DataTableColumnHeader
  //         column={column}
  //         title=""
  //         className="-mb-[1.8px] px-2"
  //       />
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const status = row.original.status;
  //     return (
  //       <div>
  //         {status === PaymentStatus.PENDING && (
  //           <Button className="font-semibold text-[.8rem]">Pay Now</Button>
  //         )}
  //       </div>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
];

const Payments = () => {
  const { copyToClipboard } = useCopy();
  const [searchValue, setSearchValue] = useState("");
  const authenticated = useAppSelector((state) => state.user.authenticated);
  const [statuses, setStatuses] = useState<
    { value: PaymentStatus; label: string }[]
  >([{ value: PaymentStatus.SUCCESSFUL, label: PaymentStatus.SUCCESSFUL }]);
  const [debouncedValue, setDebouncedValue] = useState("");
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
  const { data, isLoading } = useGetAllPaymentsQuery({
    search: debouncedValue,
    statuses: statuses.map((status) => status.value),
    page: pagination.pageIndex - 1,
    limit: pagination.pageSize,
  });
  const { data: res, isLoading: loadingSum } = useGetPaymentSumsQuery(
    undefined,
    {
      skip: !authenticated,
    }
  );
  const sums = res?.data;
  const payments = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 0;

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
      <div className="mb-12 mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <MetricPill
          className="px-0"
          title="All Time Payments"
          content={`₦${formatNum(sums?.successful ?? 0)}`}
          icon={<Wallet strokeWidth={1.2} className="size-8" />}
          isLoading={loadingSum}
        />
      </div>
      <div className="flex items-center gap-3 justify-between">
        <Input
          value={searchValue}
          onChange={handleChange}
          placeholder="Search Payment(s)"
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
        <MultiSelect<PaymentStatus>
          options={Object.entries(PaymentStatus).map(([key, value]) => ({
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
          columns={columns(copyToClipboard)}
          data={payments}
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
          wrapperCls="col-span-12 w-full"
          customEmpty="No payments found"
          className="border-none rounded-none"
        />
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
    </div>
  );
};

export default Payments;
