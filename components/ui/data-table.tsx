"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  Table as Tbl,
  SortingState,
  VisibilityState,
  flexRender,
  PaginationState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/table/data-table-pagination";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Tbl<TData>;
  ExtraComponent?: () => React.JSX.Element;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  showSelected?: boolean;
  rowClick?: (row: Row<TData>) => void;
  rowClickSelectsCheckbox?: boolean;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  loading?: boolean;
  DataToolbar?: ({
    table,
    ExtraComponent,
  }: DataTableToolbarProps<TData>) => React.JSX.Element;
  className?: string;
  wrapperCls?: string;
  headerClassname?: string;
  headerSubClassname?: string;
  headerRowClassname?: string;
  rowSelection?: Record<string, boolean>;
  pagination?: PaginationState;
  ExtraComponent?: () => React.JSX.Element;
  showPagination?: boolean;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
  setRowSelection?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  columnFilters?: ColumnFiltersState;
  prefetch?: () => void;
  customEmpty?: string;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  cellStyles?: Record<string, string>;
  enableRowSelection?: boolean;
  getRowId?: (originalRow: TData, index: number) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  prefetch,
  wrapperCls,
  className,
  headerClassname,
  headerSubClassname,
  headerRowClassname,
  showPagination = true,
  columnFilters = [],
  rowSelection = {},
  setRowSelection,
  setColumnFilters,
  rowClick,
  rowClickSelectsCheckbox = false,
  onSelectedRowsChange,
  customEmpty = "No results.",
  pagination,
  loading = false,
  ExtraComponent = () => <></>,
  manualFiltering = false,
  showSelected = true,
  setPagination,
  DataToolbar = () => <></>,
  manualPagination = false,
  cellStyles = {},
  enableRowSelection = false,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelectionInternal, setRowSelectionInternal] = React.useState<
    Record<string, boolean>
  >({});
  const [columnFiltersInternal, setColumnFiltersInternal] =
    React.useState<ColumnFiltersState>([]);

  const allColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center -ml-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-2 pl-0 flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    pageCount,
    getRowId,
    state: {
      sorting,
      columnVisibility,
      pagination,
      rowSelection: setRowSelection ? rowSelection : rowSelectionInternal,
      columnFilters: setColumnFilters ? columnFilters : columnFiltersInternal,
    },
    onPaginationChange: setPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection || setRowSelectionInternal,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters || setColumnFiltersInternal,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination,
    manualFiltering,
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    if (onSelectedRowsChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectedRowsChange(selectedRows);
    }
  }, [
    setRowSelection ? rowSelection : rowSelectionInternal,
    onSelectedRowsChange,
    table,
  ]);

  return (
    <div className={cn("space-y-4", wrapperCls)}>
      <DataToolbar table={table} ExtraComponent={ExtraComponent} />
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader className={headerClassname}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={headerRowClassname}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={headerSubClassname}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 5 }, (_, i) => i + 1).map((index) => {
                  return (
                    <TableRow key={index}>
                      {Array.from(
                        { length: allColumns.length },
                        (_, i) => i + 1
                      ).map((index) => {
                        return (
                          <TableCell key={index}>
                            <Skeleton className="h-5 rounded-full" />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </>
            ) : (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    return (
                      <TableRow
                        key={row.id}
                        className="hover:bg-gray-100"
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const handleClick = () => {
                            if (
                              cell.column.id === "select" ||
                              cell.column.id === "actions"
                            ) {
                              return;
                            }

                            if (rowClickSelectsCheckbox) {
                              row.toggleSelected();
                            }

                            if (rowClick) {
                              rowClick(row);
                            }
                          };

                          return (
                            <TableCell
                              key={cell.id}
                              onClick={
                                cell.column.id !== "select" &&
                                cell.column.id !== "actions"
                                  ? handleClick
                                  : undefined
                              }
                              style={{
                                cursor:
                                  cell.column.id !== "select" &&
                                  cell.column.id !== "actions"
                                    ? "pointer"
                                    : "default",
                              }}
                              className={cellStyles[cell.column.id]}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="hover:bg-gray-600">
                    <TableCell
                      colSpan={allColumns.length}
                      className="h-20 text-center"
                    >
                      {customEmpty}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination
          prefetch={prefetch}
          table={table}
          showSelected={showSelected}
        />
      )}
    </div>
  );
}
