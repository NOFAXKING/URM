import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWhereClause, buildOrderBy, type DashboardSearchParams } from "@/lib/query";
import { formatDisplayDate } from "@/lib/utils";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { User } from "@prisma/client";

export const runtime = "nodejs";

function parseSearchParams(url: URL): DashboardSearchParams {
  return {
    q: url.searchParams.get("q") ?? undefined,
    field: (url.searchParams.get("field") as DashboardSearchParams["field"]) ?? undefined,
    range: (url.searchParams.get("range") as DashboardSearchParams["range"]) ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    sort: (url.searchParams.get("sort") as DashboardSearchParams["sort"]) ?? undefined,
    order: (url.searchParams.get("order") as DashboardSearchParams["order"]) ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "csv";
  const sp = parseSearchParams(url);

  const users = await prisma.user.findMany({
    where: buildWhereClause(sp),
    orderBy: buildOrderBy(sp),
  });

  const rows = users.map((u: User, i: number) => ({
    no: i + 1,
    name: u.fullName,
    phone: u.phoneNumber,
    bank: u.bankName,
    date: formatDisplayDate(u.registrationDate),
    time: u.registrationTime,
  }));

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registrations");
    sheet.columns = [
      { header: "No.", key: "no", width: 6 },
      { header: "Russian Name", key: "name", width: 28 },
      { header: "Phone Number", key: "phone", width: 20 },
      { header: "Bank Name", key: "bank", width: 22 },
      { header: "Registration Date", key: "date", width: 18 },
      { header: "Registration Time", key: "time", width: 18 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.addRows(rows);

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="registrations.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("User Registrations", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["No.", "Russian Name", "Phone Number", "Bank Name", "Date", "Time"]],
      body: rows.map((r: (typeof rows)[number]) => [r.no, r.name, r.phone, r.bank, r.date, r.time]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    const buffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="registrations.pdf"`,
      },
    });
  }

  // Default: CSV
  const header = ["No.", "Russian Name", "Phone Number", "Bank Name", "Registration Date", "Registration Time"];
  const csvEscape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const lines = [
    header.join(","),
    ...rows.map((r: (typeof rows)[number]) =>
      [r.no, r.name, r.phone, r.bank, r.date, r.time].map(csvEscape).join(",")
    ),
  ];
  const csv = "\uFEFF" + lines.join("\r\n"); // BOM for Excel/Cyrillic compatibility

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations.csv"`,
    },
  });
}
