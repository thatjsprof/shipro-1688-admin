import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { IPayment } from "@/interfaces/payment.interface";
import useCopy, { ICopy } from "@/lib/copy";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

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

  return (
    <div>
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
        customEmpty="No secure links found"
        className="border-none rounded-none"
      />
    </div>
  );
};

export default Payments;
