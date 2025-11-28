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
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  prefetch?: () => void;
  customEmpty?: string;
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
  const allSelectedRowsRef = React.useRef<Map<string, TData>>(new Map());
  const prevRowSelectionRef = React.useRef<Record<string, boolean>>({});

  const allColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;
    const selectColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
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
    enableRowSelection,
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
    if (!onSelectedRowsChange) return;

    const currentSelection = setRowSelection
      ? rowSelection
      : rowSelectionInternal;
    const prevSelection = prevRowSelectionRef.current;

    const changed =
      Object.keys(currentSelection).length !==
        Object.keys(prevSelection).length ||
      Object.keys(currentSelection).some(
        (key) => currentSelection[key] !== prevSelection[key]
      );

    if (!changed) return;

    prevRowSelectionRef.current = { ...currentSelection };
    if (Object.keys(currentSelection).length === 0) {
      allSelectedRowsRef.current.clear();
      onSelectedRowsChange([]);
      return;
    }
    data.forEach((row, index) => {
      const id = getRowId ? getRowId(row, index) : index.toString();

      if (currentSelection[id]) {
        allSelectedRowsRef.current.set(id, row);
      } else {
        allSelectedRowsRef.current.delete(id);
      }
    });

    onSelectedRowsChange([...allSelectedRowsRef.current.values()]);
  }, [
    rowSelection,
    rowSelectionInternal,
    data,
    getRowId,
    onSelectedRowsChange,
    setRowSelection,
  ]);

  return (
    <div className={cn("space-y-4", wrapperCls)}>
      <DataToolbar table={table} ExtraComponent={ExtraComponent} />

      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader className={cn(headerClassname)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={cn(headerRowClassname)}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(headerSubClassname)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: allColumns.length }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionOrSelect =
                      cell.column.id === "select" ||
                      cell.column.id === "actions";

                    const handleClick = () => {
                      if (isActionOrSelect) return;
                      if (rowClickSelectsCheckbox) row.toggleSelected();
                      rowClick?.(row);
                    };

                    return (
                      <TableCell
                        key={cell.id}
                        onClick={handleClick}
                        className={cn(
                          "cursor-pointer",
                          cellStyles[cell.column.id]
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  {customEmpty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <DataTablePagination table={table} prefetch={prefetch} />
      )}
    </div>
  );
}
