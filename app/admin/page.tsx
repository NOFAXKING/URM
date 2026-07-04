import { prisma } from "@/lib/prisma";
import { buildWhereClause, buildOrderBy, getPagination, type DashboardSearchParams } from "@/lib/query";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { StatsCards } from "@/components/admin/stats-cards";
import { FiltersBar } from "@/components/admin/filters-bar";
import { UsersTable } from "@/components/admin/users-table";
import { DashboardPagination } from "@/components/admin/pagination";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const sp = await searchParams;
  const where = buildWhereClause(sp);
  const orderBy = buildOrderBy(sp);
  const { page, pageSize, skip, take } = getPagination(sp);

  const now = new Date();

  const [users, totalFiltered, total, todayCount, weekCount, monthCount] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip, take }),
    prisma.user.count({ where }),
    prisma.user.count(),
    prisma.user.count({
      where: { registrationDate: { gte: startOfDay(now), lte: endOfDay(now) } },
    }),
    prisma.user.count({
      where: {
        registrationDate: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      },
    }),
    prisma.user.count({
      where: { registrationDate: { gte: startOfMonth(now), lte: endOfMonth(now) } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  return (
    <div className="space-y-6">
      <StatsCards total={total} today={todayCount} week={weekCount} month={monthCount} />

      <Card>
        <div className="space-y-4 p-4 md:p-6">
          <FiltersBar />
        </div>
        <UsersTable users={users} startIndex={skip} />
        <DashboardPagination page={page} totalPages={totalPages} />
      </Card>
    </div>
  );
}
