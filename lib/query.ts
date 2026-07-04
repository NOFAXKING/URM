import type { Prisma } from "@prisma/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";

export type DashboardSearchParams = {
  q?: string;
  field?: "all" | "name" | "phone" | "bank";
  range?: "today" | "yesterday" | "week" | "month" | "custom" | "all";
  from?: string;
  to?: string;
  sort?: "date" | "name" | "phone" | "bank";
  order?: "asc" | "desc";
  page?: string;
};

const PAGE_SIZE = 25;

export function buildWhereClause(sp: DashboardSearchParams): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  const conditions: Prisma.UserWhereInput[] = [];

  if (sp.q && sp.q.trim()) {
    const q = sp.q.trim();
    const field = sp.field ?? "all";
    if (field === "name") {
      conditions.push({ fullName: { contains: q, mode: "insensitive" } });
    } else if (field === "phone") {
      conditions.push({ phoneNumber: { contains: q, mode: "insensitive" } });
    } else if (field === "bank") {
      conditions.push({ bankName: { contains: q, mode: "insensitive" } });
    } else {
      conditions.push({
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { phoneNumber: { contains: q, mode: "insensitive" } },
          { bankName: { contains: q, mode: "insensitive" } },
        ],
      });
    }
  }

  const now = new Date();
  switch (sp.range) {
    case "today":
      conditions.push({ registrationDate: { gte: startOfDay(now), lte: endOfDay(now) } });
      break;
    case "yesterday": {
      const y = subDays(now, 1);
      conditions.push({ registrationDate: { gte: startOfDay(y), lte: endOfDay(y) } });
      break;
    }
    case "week":
      conditions.push({
        registrationDate: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      });
      break;
    case "month":
      conditions.push({ registrationDate: { gte: startOfMonth(now), lte: endOfMonth(now) } });
      break;
    case "custom":
      if (sp.from || sp.to) {
        conditions.push({
          registrationDate: {
            ...(sp.from ? { gte: startOfDay(new Date(sp.from)) } : {}),
            ...(sp.to ? { lte: endOfDay(new Date(sp.to)) } : {}),
          },
        });
      }
      break;
    default:
      break;
  }

  if (conditions.length) where.AND = conditions;
  return where;
}

export function buildOrderBy(sp: DashboardSearchParams): Prisma.UserOrderByWithRelationInput {
  const order = sp.order ?? "desc";
  switch (sp.sort) {
    case "name":
      return { fullName: order };
    case "phone":
      return { phoneNumber: order };
    case "bank":
      return { bankName: order };
    case "date":
    default:
      return { registrationDate: order };
  }
}

export function getPagination(sp: DashboardSearchParams) {
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  return { page, pageSize: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
}

export { PAGE_SIZE };
