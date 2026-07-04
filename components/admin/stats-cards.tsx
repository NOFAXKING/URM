import { Users, CalendarDays, CalendarRange, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
};

export function StatsCards({
  total,
  today,
  week,
  month,
}: {
  total: number;
  today: number;
  week: number;
  month: number;
}) {
  const stats: Stat[] = [
    { label: "Total Users", value: total, icon: Users, accent: "text-primary bg-primary/10" },
    { label: "Today's Registrations", value: today, icon: Calendar, accent: "text-success bg-success/10" },
    { label: "Weekly Registrations", value: week, icon: CalendarDays, accent: "text-amber-600 bg-amber-500/10" },
    { label: "Monthly Registrations", value: month, icon: CalendarRange, accent: "text-violet-600 bg-violet-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="animate-in">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value.toLocaleString()}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.accent)}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
