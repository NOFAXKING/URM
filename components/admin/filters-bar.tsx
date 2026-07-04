"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButtons } from "@/components/admin/export-buttons";

export function FiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination on filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, startTransition]
  );

  // Debounce the free-text search input.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) {
        updateParam("q", q);
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const range = searchParams.get("range") ?? "all";
  const field = searchParams.get("field") ?? "all";
  const sort = searchParams.get("sort") ?? "date";
  const order = searchParams.get("order") ?? "desc";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, or bank..."
              className="pl-9"
            />
          </div>

          <Select value={field} onValueChange={(v) => updateParam("field", v)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fields</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={(v) => updateParam("range", v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ExportButtons />
      </div>

      {range === "custom" && (
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="date"
            defaultValue={searchParams.get("from") ?? ""}
            onChange={(e) => updateParam("from", e.target.value)}
            className="w-full sm:w-44"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            defaultValue={searchParams.get("to") ?? ""}
            onChange={(e) => updateParam("to", e.target.value)}
            className="w-full sm:w-44"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Sort by</span>
        <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="phone">Phone Number</SelectItem>
            <SelectItem value="bank">Bank Name</SelectItem>
          </SelectContent>
        </Select>
        <Select value={order} onValueChange={(v) => updateParam("order", v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
