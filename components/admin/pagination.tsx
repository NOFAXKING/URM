"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pages: number[] = [];
  const windowSize = 2;
  for (let p = Math.max(1, page - windowSize); p <= Math.min(totalPages, page + windowSize); p++) {
    pages.push(p);
  }

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => goTo(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages[0] > 1 && <span className="px-1 text-sm text-muted-foreground">...</span>}
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            className={cn("tabular-nums")}
            onClick={() => goTo(p)}
          >
            {p}
          </Button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <span className="px-1 text-sm text-muted-foreground">...</span>
        )}
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
