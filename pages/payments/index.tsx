import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IPayment } from "@/interfaces/payment.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import debounce from "lodash.debounce";
import { Search, X } from "lucide-react";
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
    accessorKey: "token",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Token"
        className="-mb-[1.8px] px-2"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-[0.9rem] text-nowrap h-8">
          ...{row.getValue<string>("token").slice(-5)}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "platform",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Platform"
        className="-mb-[1.8px] px-2"
      />
    ),
    cell: ({ row }) => {
      return <div className="flex items-center gap-[0.6rem] text-nowrap"></div>;
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
      return (
        <div className="flex items-center gap-[0.9rem] text-nowrap capitalize">
          {row.getValue("status")}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const createdAt = row.getValue<Date>("createdAt");
      return <div className="flex items-center gap-[0.9rem] text-nowrap"></div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => {
      return <div></div>;
    },
    cell: ({ row }) => {
      const expiresAt = row.getValue<number>("expiresAt");
      return <div className="flex items-center gap-[0.9rem] text-nowrap"></div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" className="px-2" />
    ),
    cell: ({ row }) => {
      return <div></div>;
    },
  },
];

const Payments = () => {
  const { copyToClipboard } = useCopy();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
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

  return (
    <div className="mt-7">
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
        <Button className="shadow-none h-11">Create New</Button>
      </div>
      <div className="grid grid-cols-12 mt-8">
        <DataTable
          columns={columns(copyToClipboard)}
          data={[]}
          pageCount={0}
          manualPagination={true}
          manualFiltering={true}
          loading={false}
          pagination={pagination}
          showSelected={false}
          setPagination={setPagination}
          showPagination={false}
          headerRowClassname="hover:bg-transparent"
          headerSubClassname="!px-0"
          wrapperCls="col-span-12 w-full"
          customEmpty="No secure links found"
          className="border-none rounded-none"
        />
        <div className="mt-7">
          <AdvancedPagination
            initialPage={pagination.pageIndex}
            isLoading={false}
            totalPages={0}
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
