"use client";

import { useSearchParams } from "next/navigation";
import { Download, FileSpreadsheet, FileText, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportButtons() {
  const searchParams = useSearchParams();

  function exportAs(format: "csv" | "xlsx" | "pdf") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("format", format);
    window.location.href = `/api/admin/export?${params.toString()}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportAs("xlsx")}>
          <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAs("csv")}>
          <Sheet className="h-4 w-4" /> CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAs("pdf")}>
          <FileText className="h-4 w-4" /> PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
