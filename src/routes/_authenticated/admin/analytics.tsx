import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Boxes, Download, PackageCheck, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminAnalytics } from "@/lib/analytics.functions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalytics,
});

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const PIE_COLORS = [
  "var(--color-accent)",
  "var(--color-primary)",
  "var(--color-muted-foreground)",
  "var(--color-destructive)",
];

function AdminAnalytics() {
  const [rangeDays, setRangeDays] = useState<Range>(30);

  const analytics = useQuery({
    queryKey: ["admin-analytics", rangeDays],
    queryFn: () => adminAnalytics({ data: { rangeDays } }),
  });

  const data = analytics.data;

  function exportCsv() {
    if (!data) return;
    const rows: string[][] = [
      ["Metric", "Value"],
      ["Range (days)", String(data.rangeDays)],
      ["Products", String(data.totals.products)],
      ["Active products", String(data.totals.activeProducts)],
      ["Draft products", String(data.totals.draftProducts)],
      ["Categories", String(data.totals.categories)],
      ["Units on hand", String(data.totals.unitsOnHand)],
      ["Inventory value (EGP)", String(Math.round(data.totals.inventoryValue))],
      ["Average price (EGP)", String(Math.round(data.totals.averagePrice))],
      ["Low stock", String(data.totals.lowStock)],
      ["Out of stock", String(data.totals.outOfStock)],
      ["Stock movements", String(data.totals.movementsInRange)],
      ["Units added", String(data.totals.unitsAdded)],
      ["Units removed", String(data.totals.unitsRemoved)],
      [],
      ["Category", "Stock value (EGP)", "Units", "Products"],
      ...data.byCategory.map((bucket) => [
        bucket.label,
        String(Math.round(bucket.value)),
        String(bucket.units),
        String(bucket.products),
      ]),
      [],
      ["Product", "SKU", "Stock value (EGP)", "Units"],
      ...data.topByValue.map((row) => [
        row.name,
        row.sku,
        String(Math.round(row.value)),
        String(row.units),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `silvex-analytics-${data.rangeDays}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow text-muted-foreground">Back office</p>
          <h1 className="display-md mt-3">Analytics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Catalogue, stock and activity trends across the last {rangeDays} days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border">
            {RANGES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRangeDays(value)}
                className={cn(
                  "px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
                  rangeDays === value && "bg-surface text-foreground",
                )}
              >
                {value}d
              </button>
            ))}
          </div>
          <Button variant="outlineHero" onClick={exportCsv} disabled={!data}>
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
      </header>

      {analytics.isError && (
        <p className="mt-8 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {(analytics.error as Error).message}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Inventory value"
          value={data ? formatPrice(data.totals.inventoryValue) : "—"}
          hint={`${data?.totals.unitsOnHand ?? 0} units on hand`}
          icon={Boxes}
        />
        <Kpi
          label="Average price"
          value={data ? formatPrice(data.totals.averagePrice) : "—"}
          hint={`${data?.totals.products ?? 0} products, ${data?.totals.activeProducts ?? 0} live`}
          icon={PackageCheck}
        />
        <Kpi
          label="Stock movements"
          value={data ? String(data.totals.movementsInRange) : "—"}
          hint={`+${data?.totals.unitsAdded ?? 0} in · −${data?.totals.unitsRemoved ?? 0} out`}
          icon={TrendingUp}
        />
        <Kpi
          label="Needs attention"
          value={data ? String(data.totals.lowStock + data.totals.outOfStock) : "—"}
          hint={`${data?.totals.lowStock ?? 0} low · ${data?.totals.outOfStock ?? 0} sold out`}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Stock movement trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.movementSeries ?? []}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => value.slice(5)}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="inbound"
                name="Units in"
                stroke="var(--color-accent)"
                fill="var(--color-accent)"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="outbound"
                name="Units out"
                stroke="var(--color-destructive)"
                fill="var(--color-destructive)"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Catalogue status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.statusBreakdown ?? []}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {(data?.statusBreakdown ?? []).map((entry, index) => (
                  <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {(data?.statusBreakdown ?? []).map((entry, index) => (
              <li key={entry.label} className="flex items-center gap-2">
                <span
                  className="inline-block size-2"
                  style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                {entry.label} · {entry.value}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Stock value by range">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.byCategory ?? []} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid stroke="var(--color-border)" horizontal={false} />
              <XAxis
                type="number"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
                contentStyle={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" name="Stock value" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Highest value stock">
          {(data?.topByValue ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {(data?.topByValue ?? []).map((row) => (
                <li key={row.sku} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate">{row.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.sku} · {row.units} units
                    </span>
                  </span>
                  <span className="shrink-0">{formatPrice(row.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Low and out of stock">
          {(data?.lowStockRows ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Everything is above its threshold.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {(data?.lowStockRows ?? []).map((row) => (
                <li key={row.sku} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0 truncate">{row.name}</span>
                  <span className={cn("shrink-0", row.stock === 0 ? "text-destructive" : "text-accent")}>
                    {row.stock} / {row.threshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent back-office activity">
          {(data?.recentActivity ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Catalogue and stock changes will be logged here.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {(data?.recentActivity ?? []).map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0 truncate">
                    {row.action.replaceAll(".", " ")}
                    <span className="ml-2 text-xs text-muted-foreground">{row.entity}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-background p-6", className)}>
      <h2 className="label-eyebrow text-muted-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <p className="label-eyebrow text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-4 font-display text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
