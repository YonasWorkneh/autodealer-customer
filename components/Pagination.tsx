"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type ListingPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const getPages = (current: number, total: number) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: ListingPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPages(currentPage, totalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className="mx-auto flex items-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3"
      aria-label="Pagination"
    >
      <button
        type="button"
        className="text-gray-400 hover:text-black disabled:text-gray-200 transition cursor-pointer"
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <ul className="flex items-center gap-3">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <li key={`ellipsis-${index}`} className="text-gray-400">
                <MoreHorizontal className="h-4 w-4" />
              </li>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="text-gray-400 hover:text-black disabled:text-gray-200 transition cursor-pointer  "
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
