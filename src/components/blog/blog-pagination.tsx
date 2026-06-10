import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTotalBlogPages } from "@/lib/blog";

function blogPageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export function BlogPagination({ currentPage }: { currentPage: number }) {
  const totalPages = getTotalBlogPages();
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Blog pagination"
    >
      {currentPage > 1 ? (
        <Link
          href={blogPageHref(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </span>
      )}

      <div className="flex flex-wrap items-center gap-1">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={blogPageHref(page)}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand px-3 text-sm font-semibold text-white shadow-sm"
                  : "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
              }
            >
              {page}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={blogPageHref(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground">
          Next
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
