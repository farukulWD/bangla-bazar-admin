import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Pagination } from "@/types/api";

type TablePaginationProps = {
  pagination?: Pagination;
  onPageChange: (page: number) => void;
};

const GAP = "gap";

const pageItems = (page: number, totalPage: number): (number | typeof GAP)[] => {
  const pages = new Set(
    [1, page - 1, page, page + 1, totalPage].filter(
      (value) => value >= 1 && value <= totalPage,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);

  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1];
    if (previous === undefined || value - previous === 1) return [value];
    if (value - previous === 2) return [value - 1, value];
    return [GAP, value];
  });
};

export function TablePagination({
  pagination,
  onPageChange,
}: TablePaginationProps) {
  if (!pagination || pagination.total === 0) return null;

  const { page, limit, total } = pagination;
  const totalPage = Math.max(pagination.totalPage, 1);
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t bg-card/95 px-4 py-3 text-sm shadow-[0_-4px_12px_-6px_rgb(0_0_0/0.25)] backdrop-blur supports-backdrop-filter:bg-card/85">
      <span className="text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-foreground">{total}</span>
      </span>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {pageItems(page, totalPage).map((item, index) =>
          item === GAP ? (
            <span
              key={`gap-${index}`}
              aria-hidden
              className="px-1.5 text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? "default" : "ghost"}
              size="sm"
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className="min-w-8 tabular-nums"
              onClick={() => item !== page && onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          aria-label="Next page"
          disabled={page >= totalPage}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight />
        </Button>
      </nav>
    </div>
  );
}
