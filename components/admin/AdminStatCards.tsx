import type { IconType } from "react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export type AdminStat = {
  label: string;
  value: string | number;
  hint?: string;
  icon: IconType;
};

export default function AdminStatCards({ stats }: { stats: AdminStat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-none">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardDescription className="font-medium text-muted-foreground">
              {stat.label}
            </CardDescription>
            <stat.icon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-newsreader)] text-3xl font-medium tracking-tight">
              {stat.value}
            </p>
            {stat.hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
