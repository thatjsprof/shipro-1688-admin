import ActionAlert from "@/components/ui/action-alert";
import AdvancedPagination from "@/components/ui/advanced-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IReview, ReviewStatus } from "@/interfaces/product.interface";
import { stripRichHtml } from "@/lib/rich-text";
import { notify } from "@/lib/toast";
import {
  useDeleteReviewMutation,
  useGetReviewsQuery,
  useUpdateReviewStatusMutation,
} from "@/services/product.service";
import { useAppSelector } from "@/store/hooks";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, Star, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const STATUS_TABS: { value: ReviewStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

const statusBadge: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={
          value <= rating
            ? "size-3.5 fill-yellow-400 text-yellow-400"
            : "size-3.5 text-gray-300"
        }
      />
    ))}
  </div>
);

const ReviewsPage = () => {
  const authenticated = useAppSelector((state) => state.user.authenticated);
  const [status, setStatus] = useState<ReviewStatus | "ALL">("PENDING");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  });
  const pagination = useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );
  const { data, isLoading, isFetching } = useGetReviewsQuery(
    {
      page: pageIndex - 1,
      limit: pageSize,
      status: status === "ALL" ? undefined : status,
    },
    { skip: !authenticated }
  );
  const reviews = data?.data.data ?? [];
  const totalPages = data?.data.totalPages ?? 0;
  const [updateStatus] = useUpdateReviewStatusMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<IReview | null>(null);

  useEffect(() => {
    document.title = "Reviews | Shipro Africa";
  }, []);

  const handleStatus = useCallback(
    async (review: IReview, next: ReviewStatus) => {
      setUpdatingId(review.id);
      try {
        const res = await updateStatus({ id: review.id, status: next }).unwrap();
        notify(res.message ?? "Review updated", "success");
      } catch (err: any) {
        notify(err?.data?.message ?? "Failed to update review", "error");
      } finally {
        setUpdatingId(null);
      }
    },
    [updateStatus]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!reviewToDelete) return;
    try {
      const res = await deleteReview(reviewToDelete.id).unwrap();
      notify(res.message ?? "Review deleted", "success");
      setReviewToDelete(null);
    } catch (err: any) {
      notify(err?.data?.message ?? "Failed to delete review", "error");
    }
  }, [deleteReview, reviewToDelete]);

  const columns = useMemo<ColumnDef<IReview>[]>(
    () => [
      {
        id: "product",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product" />
        ),
        cell: ({ row }) => {
          const product = row.original.product;
          return (
            <Link
              href={`/products/${row.original.productId}`}
              className="flex items-center gap-3 w-[16rem]"
            >
              {product?.image && (
                <img
                  src={product.image}
                  alt="Product"
                  className="h-12 w-12 rounded-sm object-cover border shrink-0"
                />
              )}
              <span className="line-clamp-2 text-sm hover:underline">
                {stripRichHtml(product?.description ?? "")}
              </span>
            </Link>
          );
        },
      },
      {
        id: "review",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Review" />
        ),
        cell: ({ row }) => {
          const review = row.original;
          return (
            <div className="flex flex-col gap-1.5 w-[22rem] text-wrap">
              <Stars rating={review.rate_star} />
              <p className="text-sm">{review.feedback}</p>
              {!!review.images?.length && (
                <div className="flex flex-wrap gap-1.5">
                  {review.images.map((image) => (
                    <a
                      key={image.url}
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={image.url}
                        alt={image.fileName}
                        className="h-12 w-12 rounded-sm object-cover border hover:opacity-80"
                      />
                    </a>
                  ))}
                </div>
              )}
              {review.sku_map && (
                <p className="text-xs text-muted-foreground">
                  {review.sku_map}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "customer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer" />
        ),
        cell: ({ row }) => {
          const review = row.original;
          return (
            <div className="text-sm text-nowrap">
              <p>{review.user_nick}</p>
              <p className="text-xs text-muted-foreground">
                {review.user?.email ??
                  (review.orderItemId ? "Deleted user" : "Added by admin")}
              </p>
            </div>
          );
        },
      },
      {
        id: "date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => (
          <span className="text-nowrap text-sm">
            {format(new Date(row.original.feedback_date), "dd MMM yyyy")}
          </span>
        ),
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={statusBadge[row.original.status]}
          >
            {row.original.status.toLowerCase()}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="" />
        ),
        cell: ({ row }) => {
          const review = row.original;
          const busy = updatingId === review.id;
          return (
            <div className="flex items-center gap-1">
              {review.status !== "APPROVED" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => handleStatus(review, "APPROVED")}
                >
                  <Check className="size-4" />
                  Approve
                </Button>
              )}
              {review.status !== "REJECTED" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => handleStatus(review, "REJECTED")}
                >
                  <X className="size-4" />
                  Reject
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setReviewToDelete(review)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleStatus, updatingId]
  );

  return (
    <div className="mt-7 space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Approve customer reviews before they appear on Shipro product pages.
        </p>
      </div>

      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value as ReviewStatus | "ALL");
          setPagination((prev) => ({ ...prev, pageIndex: 1 }));
        }}
      >
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={reviews}
        pageCount={totalPages}
        manualPagination={true}
        manualFiltering={true}
        loading={isLoading || isFetching}
        pagination={pagination}
        setPagination={setPagination}
        showSelected={false}
        showPagination={false}
        headerRowClassname="hover:bg-transparent"
        headerSubClassname="!px-0"
        customEmpty="No reviews found"
        className="border-none rounded-none"
      />

      <AdvancedPagination
        initialPage={pagination.pageIndex}
        isLoading={isLoading || isFetching}
        totalPages={totalPages}
        showPageSizeSelector
        pageSize={pagination.pageSize}
        onPageSizeChange={(size) =>
          setPagination((prev) => ({ ...prev, pageSize: size }))
        }
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, pageIndex: page }))
        }
      />

      <ActionAlert
        open={!!reviewToDelete}
        setOpen={(open) => !open && setReviewToDelete(null)}
        title="Delete review?"
        body="This permanently removes the review. This cannot be undone."
        actionText="Delete review"
        loading={isDeleting}
        handleAction={handleConfirmDelete}
        closeCls="shadow-none"
      />
    </div>
  );
};

export default ReviewsPage;
