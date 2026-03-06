import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@raypx/design-system/components/ui/pagination";
import { useMemo } from "react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  isTransitioning: boolean;
  onPageChange: (nextPage: number) => void;
}

export function AdminPagination({
  currentPage,
  totalPages,
  isTransitioning,
  onPageChange,
}: AdminPaginationProps) {
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];

    const visibleCount = Math.min(5, totalPages);
    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - visibleCount + 1));

    return Array.from({ length: visibleCount }, (_, i) => startPage + i);
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={isTransitioning || currentPage <= 1}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage - 1);
              }}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                aria-disabled={isTransitioning}
                href="#"
                isActive={currentPage === pageNum}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNum);
                }}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              aria-disabled={isTransitioning || currentPage >= totalPages}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
