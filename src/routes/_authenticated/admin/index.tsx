import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, Package, Tags } from "lucide-react";

import { adminListCategories, adminListProducts, adminListStockMovements } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const products = useQuery({
    queryKey: ["admin-products", {}],
    queryFn: () => adminListProducts({ data: {} }),
  });
  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminListCategories(),
  });
  const movements = useQuery({
    queryKey: ["admin-movements", {}],
    queryFn: () => adminListStockMovements({ data: {} }),
  });

  const items = products.data ?? [];
  const lowStock = items.filter((item) => item.stock_quantity <= item.low_stock_threshold);
  const inventoryValue = items.reduce(
    (sum, item) => sum + Number(item.price) * item.stock_quantity,
    0,
  );

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow text-muted-foreground">Back office</p>
          <h1 className="display-md mt-3">Dashboard</h1>
        </div>
        <Link to="/admin/analytics" className="link-underline text-xs">
          View analytics
        </Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Products"
          value={products.isPending ? "—" : String(items.length)}
          hint={`${items.filter((item) => item.status === "active").length} live`}
          icon={Package}
        />
        <Kpi
          label="Categories"
          value={categories.isPending ? "—" : String((categories.data ?? []).length)}
          hint={`${(categories.data ?? []).filter((category) => category.is_active).length} visible`}
          icon={Tags}
        />
        <Kpi
          label="Inventory value"
          value={products.isPending ? "—" : formatPrice(inventoryValue)}
          hint="Retail value of stock on hand"
          icon={Boxes}
        />
        <Kpi
          label="Low stock"
          value={products.isPending ? "—" : String(lowStock.length)}
          hint="At or below threshold"
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="label-eyebrow text-muted-foreground">Low stock</h2>
            <Link to="/admin/inventory" className="link-underline text-xs">
              Manage stock
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Every product is above its threshold.</p>
          ) : (
            <ul className="mt-5 divide-y divide-border text-sm">
              {lowStock.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0 text-accent">{item.stock_quantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-border bg-background p-6">
          <h2 className="label-eyebrow text-muted-foreground">Recent stock movements</h2>
          {(movements.data ?? []).length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Stock adjustments will appear here once you make one.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-border text-sm">
              {(movements.data ?? []).slice(0, 6).map((movement) => (
                <li key={movement.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="truncate">
                    {movement.products?.name ?? "Product"}
                    <span className="ml-2 text-xs text-muted-foreground">{movement.reason}</span>
                  </span>
                  <span className={movement.delta > 0 ? "text-accent" : "text-destructive"}>
                    {movement.delta > 0 ? "+" : ""}
                    {movement.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
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
