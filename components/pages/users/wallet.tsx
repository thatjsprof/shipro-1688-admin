import MetricPill from "@/components/shared/metric-pill";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import {
  ActionTypes,
  IWalletTransation,
  WalletTransactionStatus,
} from "@/interfaces/wallet.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { cn, formatNum } from "@/lib/utils";
import {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useGetWalletTransactionsSumQuery,
} from "@/services/wallet.service";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import debounce from "lodash.debounce";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Copy,
  MoveUpRight,
  MoveDownLeft,
  Wallet2,
  X,
  Search,
} from "lucide-react";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { PaymentStatusPill, walletStatusInfo } from "./pills";
import { format } from "date-fns";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import WalletAdjustment from "@/components/pages/users/wallet-adjustment";

const columns = (
  copyToClipboard: ({ id, text, message, style }: ICopy) => void
): ColumnDef<IWalletTransation>[] => [
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
                id: "copy-transaction-reference",
                text: reference,
                message: "Transaction reference copied to clipboard",
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
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Type"
        className="-mb-[1.8px] px-2"
      />
    ),
    cell: ({ row }) => {
      const type = row.getValue<ActionTypes>("type");
      const isCredit = type === ActionTypes.CREDIT;
      return (
        <div className="flex items-center gap-[0.9rem] text-nowrap capitalize">
          <p
            className={cn(
              "flex items-center gap-1",
              isCredit ? "text-green-600" : "text-red-600"
            )}
          >
            {isCredit ? (
              <MoveDownLeft className="text-green=500 size-4" />
            ) : (
              <MoveUpRight className="text-red-500 size-4" />
            )}{" "}
            <span>{isCredit ? "Inflow" : "Outflow"}</span>
          </p>
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
      const amount = row.getValue<string>("amount");
      const type = row.original.type;
      return (
        <div
          className={cn(
            "flex items-center gap-[0.6rem] text-nowrap",
            type === ActionTypes.CREDIT ? "text-green-600" : "text-red-600"
          )}
        >
          ₦{formatNum(amount)}
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
      const status = row.getValue<WalletTransactionStatus>("status");
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
];

const Wallet = () => {
  const router = useRouter();
  const { id } = router.query;
  const userId = id as string;
  const { copyToClipboard } = useCopy();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [statuses, setStatuses] = useState<
    { value: WalletTransactionStatus; label: string }[]
  >([]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const allowedStatuses = [
    WalletTransactionStatus.PENDING,
    WalletTransactionStatus.SUCCESSFUL,
    WalletTransactionStatus.FAILED,
  ];

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const { data: walletRes, isLoading: loadingWallet } = useGetWalletQuery(
    userId,
    {
      skip: !userId,
    }
  );
  const balance = walletRes?.data.balance ?? 0;
  const {
    data: dataTrns,
    isLoading: loadingTrns,
    isFetching,
  } = useGetWalletTransactionsQuery(
    {
      search: debouncedValue,
      statuses: statuses.map((status) => status.value),
      page: pagination.pageIndex - 1,
      limit: pagination.pageSize,
      userId,
    },
    {
      skip: !userId,
    }
  );
  const { data: dataSum, isLoading: loadingSum } =
    useGetWalletTransactionsSumQuery(userId, {
      skip: !userId,
    });

  const transactions = dataTrns?.data?.data ?? [];
  const totalPages = dataTrns?.data?.totalPages ?? 0;
  const sums = dataSum?.data;

  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedValue(value);
    }, 300),
    [300]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    debouncedChangeHandler(value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setDebouncedValue("");
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="mb-12 mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <MetricPill
          className="p-7 bg-primary rounded-lg text-white"
          title="Balance"
          content={`₦${formatNum(balance ?? 0)}`}
          icon={<Wallet2 strokeWidth={1.2} className="size-8 text-gray-200" />}
          isLoading={loadingWallet}
        />
        <MetricPill
          className="px-7"
          title="Total Inflow"
          content={`₦${formatNum(sums?.totalCredits ?? 0)}`}
          icon={<BanknoteArrowUp strokeWidth={1.2} className="size-8" />}
          isLoading={loadingSum}
        />
        <MetricPill
          className="px-7"
          title="Total Outflow"
          content={`₦${formatNum(sums?.totalDebits ?? 0)}`}
          icon={<BanknoteArrowDown strokeWidth={1.2} className="size-8" />}
          isLoading={loadingSum}
        />
      </div>
      {userId && <WalletAdjustment userId={userId} />}
      <div className="mt-14">
        <h2 className="font-semibold mb-6">Wallet Transactions</h2>
        <div className="flex items-center gap-2 mb-7">
          <Input
            value={searchValue}
            onChange={handleChange}
            className="bg-transparent h-12 pl-[3.4rem] !text-[1rem]"
            placeholder="Search transaction(s)"
            StartIcon={<Search className="ml-5 text-gray-400 size-5" />}
            EndIcon={
              searchValue ? (
                <X
                  className="text-gray-400 -mr-[.1rem] h-4 w-4 cursor-pointer"
                  onClick={handleClearSearch}
                />
              ) : null
            }
          />
          <MultiSelect<WalletTransactionStatus>
            options={allowedStatuses.map((status) => ({
              value: status,
              label: walletStatusInfo[status]?.text ?? "",
            }))}
            selected={statuses}
            onChange={(values) => setStatuses(values)}
            placeholder="Select statuses"
          />
        </div>
        <DataTable
          columns={columns(copyToClipboard)}
          data={transactions}
          pageCount={totalPages}
          manualPagination={true}
          manualFiltering={true}
          loading={loadingTrns || isFetching}
          pagination={pagination}
          showSelected={false}
          setPagination={setPagination}
          showPagination={false}
          headerRowClassname="hover:bg-transparent"
          headerSubClassname="!px-0"
          customEmpty="No Transactions Found"
          className="border-none rounded-none"
        />
        <div className="mt-7">
          <AdvancedPagination
            initialPage={pagination.pageIndex}
            isLoading={loadingTrns || isFetching}
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
    </div>
  );
};

export default Wallet;
