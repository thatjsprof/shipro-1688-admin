import DiscountDialog from "@/components/pages/discounts/discount-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Switch } from "@/components/ui/switch";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import {
  DiscountRule,
  IDiscount,
} from "@/interfaces/discount.interface";
import { notify } from "@/lib/toast";
import {
  useGetDiscountsQuery,
  useUpdateDiscountMutation,
} from "@/services/management.service";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ruleLabel: Record<DiscountRule, string> = {
  [DiscountRule.ONE_PER_USER]: "Once per user",
  [DiscountRule.MULTIPLE_PER_USER]: "Multiple per user",
  [DiscountRule.SINGLE_USE]: "Single use",
  [DiscountRule.PUBLIC]: "Public",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "dd MMM yyyy, h:mm a");
};

const DiscountsPage = () => {
  const { data, isLoading, refetch } = useGetDiscountsQuery();
  const [updateDiscount] = useUpdateDiscountMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IDiscount | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const discounts = data?.data ?? [];

  useEffect(() => {
    document.title = "Discounts | Shipro Africa";
  }, []);

  const columns = useMemo<ColumnDef<IDiscount>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            className="font-semibold tracking-wide hover:text-secondary"
            onClick={() => {
              setEditing(row.original);
              setOpen(true);
            }}
          >
            {row.original.title}
          </button>
        ),
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Value" />
        ),
        cell: ({ row }) => {
          const isFixed =
            row.original.type === "FIXED_AMOUNT" ||
            (row.original.amount != null &&
              row.original.amount > 0 &&
              !row.original.percentage);
          if (isFixed) {
            return <span>₦{Number(row.original.amount).toLocaleString()}</span>;
          }
          return <span>{row.original.percentage}%</span>;
        },
      },
      {
        accessorKey: "rule",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rule" />
        ),
        cell: ({ row }) => (
          <span className="text-nowrap">
            {ruleLabel[row.original.rule] ?? row.original.rule}
          </span>
        ),
      },
      {
        accessorKey: "scope",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Scope" />
        ),
        cell: ({ row }) =>
          row.original.global ? (
            <Badge variant="secondary">Everyone</Badge>
          ) : (
            <div className="max-w-[14rem]">
              <Badge variant="outline">
                {row.original.users?.length || 1} user
                {(row.original.users?.length || 1) === 1 ? "" : "s"}
              </Badge>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {row.original.users?.map((user) => user.email).join(", ") ||
                  row.original.user?.email ||
                  row.original.userId}
              </p>
            </div>
          ),
      },
      {
        accessorKey: "redemptions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Redemptions" />
        ),
        cell: ({ row }) => {
          const used = row.original.redemptionCount ?? 0;
          const max = row.original.maxRedemptions;
          return (
            <span>
              {used}
              {max != null ? ` / ${max}` : " / ∞"}
            </span>
          );
        },
      },
      {
        accessorKey: "expiresAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expires" />
        ),
        cell: ({ row }) => {
          const expired =
            row.original.expiresAt &&
            new Date(row.original.expiresAt).getTime() <= Date.now();
          return (
            <span className={expired ? "text-destructive" : undefined}>
              {formatDate(row.original.expiresAt)}
            </span>
          );
        },
      },
      {
        accessorKey: "active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Active" />
        ),
        cell: ({ row }) => (
          <Switch
            checked={row.original.active}
            onCheckedChange={async (active) => {
              try {
                const res = await updateDiscount({
                  id: row.original.id,
                  body: { active },
                }).unwrap();
                notify(res.message || (active ? "Activated" : "Deactivated"));
              } catch (err: any) {
                notify(err?.data?.message || "Failed to update discount");
                refetch();
              }
            }}
          />
        ),
      },
    ],
    [refetch, updateDiscount]
  );

  return (
    <div className="mt-7 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Discounts</h1>
          <p className="text-sm text-muted-foreground">
            Create promo codes with expiry, user scope, and redemption limits.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1 size-4" />
          Create discount
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={discounts}
        pageCount={1}
        loading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        showSelected={false}
        showPagination={false}
        customEmpty="No discounts yet"
      />

      <DiscountDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        discount={editing}
      />
    </div>
  );
};

export default DiscountsPage;
