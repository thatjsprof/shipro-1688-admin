import React, { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useBreakpointBelow from "@/hooks/use-breakpoint";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from "./select";

export interface AdvancedPaginationProps {
  totalPages: number;
  totalItems?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  visiblePagesCount?: number;
  showFirstAndLast?: boolean;
  showPrevNext?: boolean;
  showItemRange?: boolean;
  isLoading?: boolean;
  className?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
}

const PaginationItemAlt = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => {
  return (
    <PaginationItem
      ref={ref}
      {...props}
      className={cn(className)}
    />
  );
});
PaginationItemAlt.displayName = "PaginationItemAlt";

const AdvancedPagination = ({
  totalPages = 10,
  totalItems,
  initialPage = 1,
  onPageChange,
  isLoading,
  visiblePagesCount: visiblePgCount = 5,
  showFirstAndLast = true,
  showPrevNext = true,
  showItemRange = false,
  className = "",
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  showPageSizeSelector = false,
}: AdvancedPaginationProps) => {
  const belowXxs = useBreakpointBelow("xxs");
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const [visiblePagesCount, setVisiblePagesCount] =
    useState<number>(visiblePgCount);
  const total = totalItems ?? totalPages * pageSize;
  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  const fetchPageResults = (page: number): void => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handlePageChange = (page: number): void => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchPageResults(page);
  };

  const handlePrevSet = (): void => {
    const targetPage = visiblePages[0] - 1;
    handlePageChange(targetPage);
  };

  const handleNextSet = (): void => {
    const targetPage = visiblePages[visiblePages.length - 1] + 1;
    handlePageChange(targetPage);
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
    setCurrentPage(1);
    if (onPageChange) {
      onPageChange(1);
    }
  };

  useEffect(() => {
    setVisiblePagesCount(visiblePgCount);
  }, [visiblePgCount]);

  useEffect(() => {
    if (belowXxs) setVisiblePagesCount(2);
    else setVisiblePagesCount(visiblePgCount);
  }, [belowXxs]);

  useEffect(() => {
    let pages: number[] = [];

    if (totalPages <= visiblePagesCount) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const halfVisible = Math.floor(visiblePagesCount / 2);

      if (currentPage <= halfVisible + 1) {
        pages = Array.from({ length: visiblePagesCount }, (_, i) => i + 1);
      } else if (currentPage >= totalPages - halfVisible) {
        pages = Array.from(
          { length: visiblePagesCount },
          (_, i) => totalPages - visiblePagesCount + i + 1
        );
      } else {
        pages = Array.from(
          { length: visiblePagesCount },
          (_, i) => currentPage - halfVisible + i
        );
      }
    }

    setVisiblePages(pages);
  }, [currentPage, totalPages, visiblePagesCount]);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  if (totalPages <= 0) return null;

  const isActive = (page: number) => page === currentPage;

  return (
    <Pagination className={className}>
      <PaginationContent className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {showItemRange && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {rangeStart} – {rangeEnd} of {total}
            </span>
          )}
          <div className="flex">
            {showFirstAndLast &&
              currentPage > Math.floor(visiblePagesCount / 2) + 1 &&
              !visiblePages.includes(1) && (
                <PaginationItemAlt>
                  <PaginationLink
                    className={cn(
                      "cursor-pointer",
                      isLoading && "opacity-50 pointer-events-none",
                      isActive(1) && "!border-none"
                    )}
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </PaginationLink>
                </PaginationItemAlt>
              )}
            {currentPage > Math.floor(visiblePagesCount / 2) + 1 &&
              !visiblePages.includes(2) && (
                <PaginationItemAlt>
                  <PaginationEllipsis
                    onClick={handlePrevSet}
                    className={cn(
                      "cursor-pointer",
                      isLoading && "opacity-50 pointer-events-none"
                    )}
                  />
                </PaginationItemAlt>
              )}
            {visiblePages.map((page) => (
              <PaginationItemAlt key={page}>
                <PaginationLink
                  className={cn(
                    isLoading && "opacity-50 pointer-events-none",
                    "cursor-pointer",
                    isActive(page) && "!bg-primary !text-white",
                    isActive(page) && "!border-none"
                  )}
                  isActive={isActive(page)}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItemAlt>
            ))}
            {currentPage < totalPages - Math.floor(visiblePagesCount / 2) &&
              !visiblePages.includes(totalPages - 1) && (
                <PaginationItemAlt>
                  <PaginationEllipsis
                    onClick={handleNextSet}
                    className={cn(
                      "cursor-pointer",
                      isLoading && "opacity-50 pointer-events-none"
                    )}
                  />
                </PaginationItemAlt>
              )}
            {showFirstAndLast &&
              currentPage < totalPages - Math.floor(visiblePagesCount / 2) &&
              !visiblePages.includes(totalPages) && (
                <PaginationItemAlt>
                  <PaginationLink
                    onClick={() => handlePageChange(totalPages)}
                    className={cn(
                      "cursor-pointer",
                      isLoading && "opacity-50 pointer-events-none"
                    )}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItemAlt>
              )}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          )}
          <div className="flex gap-2 items-center">
            {showPrevNext && (
              <>
                <PaginationItemAlt>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={cn(
                      currentPage === 1 || isLoading
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer",
                      "pr-0 px-3 border"
                    )}
                  >
                    <ChevronLeft />
                  </PaginationPrevious>
                </PaginationItemAlt>
                <PaginationItemAlt className="">
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={cn(
                      currentPage === totalPages || isLoading
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer",
                      "pr-0 px-3 border"
                    )}
                  >
                    <ChevronRight />
                  </PaginationNext>
                </PaginationItemAlt>
              </>
            )}
          </div>
        </div>
      </PaginationContent>
    </Pagination>
  );
};

export default AdvancedPagination;