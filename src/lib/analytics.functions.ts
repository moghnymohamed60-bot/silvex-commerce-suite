import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "@/lib/auth.types";
import { isStaff } from "@/lib/auth.types";

type AuthedContext = {
  supabase: {
    from: (table: string) => any;
  };
  userId: string;
  claims: Record<string, unknown>;
};

async function requireStaff(context: AuthedContext): Promise<AppRole[]> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((row: { role: AppRole }) => row.role);
  if (!isStaff(roles)) throw new Error("This area is limited to Silvex staff accounts.");
  return roles;
}

export interface AnalyticsPoint {
  date: string;
  inbound: number;
  outbound: number;
  net: number;
}

export interface AnalyticsBucket {
  label: string;
  value: number;
  units: number;
  products: number;
}

export interface AnalyticsActivity {
  id: string;
  action: string;
  entity: string;
  created_at: string;
  details: Record<string, unknown>;
}

export interface AnalyticsResult {
  rangeDays: number;
  totals: {
    products: number;
    activeProducts: number;
    draftProducts: number;
    categories: number;
    unitsOnHand: number;
    inventoryValue: number;
    potentialRevenue: number;
    averagePrice: number;
    lowStock: number;
    outOfStock: number;
    movementsInRange: number;
    unitsAdded: number;
    unitsRemoved: number;
  };
  byCategory: AnalyticsBucket[];
  statusBreakdown: { label: string; value: number }[];
  movementSeries: AnalyticsPoint[];
  movementReasons: { label: string; value: number }[];
  topByValue: { name: string; sku: string; value: number; units: number }[];
  lowStockRows: { name: string; sku: string; stock: number; threshold: number }[];
  recentActivity: AnalyticsActivity[];
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
  out_of_stock: "Out of stock",
};

export const adminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ rangeDays: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30) })
      .default({ rangeDays: 30 })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }): Promise<AnalyticsResult> => {
    const ctx = context as unknown as AuthedContext;
    await requireStaff(ctx);

    const since = new Date(Date.now() - data.rangeDays * 24 * 60 * 60 * 1000);

    const [productsRes, categoriesRes, movementsRes, activityRes] = await Promise.all([
      ctx.supabase
        .from("products")
        .select(
          "id, name, sku, price, stock_quantity, low_stock_threshold, status, category_id, categories(name)",
        ),
      ctx.supabase.from("categories").select("id, name, is_active"),
      ctx.supabase
        .from("inventory_movements")
        .select("delta, reason, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at"),
      ctx.supabase
        .from("audit_logs")
        .select("id, action, entity, created_at, details")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    if (productsRes.error) throw new Error(productsRes.error.message);
    if (categoriesRes.error) throw new Error(categoriesRes.error.message);
    if (movementsRes.error) throw new Error(movementsRes.error.message);

    type Row = {
      id: string;
      name: string;
      sku: string;
      price: number | string;
      stock_quantity: number;
      low_stock_threshold: number;
      status: string;
      category_id: string;
      categories?: { name: string } | null;
    };

    const products = (productsRes.data ?? []) as Row[];
    const categories = (categoriesRes.data ?? []) as { id: string; name: string }[];
    const movements = (movementsRes.data ?? []) as {
      delta: number;
      reason: string;
      created_at: string;
    }[];

    let unitsOnHand = 0;
    let inventoryValue = 0;
    let priceSum = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const categoryBuckets = new Map<string, AnalyticsBucket>();
    const statusCounts = new Map<string, number>();

    for (const product of products) {
      const price = Number(product.price);
      const value = price * product.stock_quantity;
      unitsOnHand += product.stock_quantity;
      inventoryValue += value;
      priceSum += price;
      if (product.stock_quantity === 0) outOfStock += 1;
      else if (product.stock_quantity <= product.low_stock_threshold) lowStock += 1;

      statusCounts.set(product.status, (statusCounts.get(product.status) ?? 0) + 1);

      const label =
        product.categories?.name ??
        categories.find((category) => category.id === product.category_id)?.name ??
        "Uncategorised";
      const bucket = categoryBuckets.get(label) ?? { label, value: 0, units: 0, products: 0 };
      bucket.value += value;
      bucket.units += product.stock_quantity;
      bucket.products += 1;
      categoryBuckets.set(label, bucket);
    }

    // Movement trend, one point per day across the whole range so gaps read as zero.
    const dayKeys: string[] = [];
    for (let index = data.rangeDays - 1; index >= 0; index -= 1) {
      const day = new Date(Date.now() - index * 24 * 60 * 60 * 1000);
      dayKeys.push(day.toISOString().slice(0, 10));
    }
    const series = new Map<string, AnalyticsPoint>(
      dayKeys.map((date) => [date, { date, inbound: 0, outbound: 0, net: 0 }]),
    );

    let unitsAdded = 0;
    let unitsRemoved = 0;
    const reasonCounts = new Map<string, number>();

    for (const movement of movements) {
      const key = movement.created_at.slice(0, 10);
      const point = series.get(key);
      if (point) {
        if (movement.delta > 0) point.inbound += movement.delta;
        else point.outbound += Math.abs(movement.delta);
        point.net += movement.delta;
      }
      if (movement.delta > 0) unitsAdded += movement.delta;
      else unitsRemoved += Math.abs(movement.delta);
      reasonCounts.set(movement.reason, (reasonCounts.get(movement.reason) ?? 0) + 1);
    }

    return {
      rangeDays: data.rangeDays,
      totals: {
        products: products.length,
        activeProducts: products.filter((product) => product.status === "active").length,
        draftProducts: products.filter((product) => product.status === "draft").length,
        categories: categories.length,
        unitsOnHand,
        inventoryValue,
        potentialRevenue: inventoryValue,
        averagePrice: products.length ? priceSum / products.length : 0,
        lowStock,
        outOfStock,
        movementsInRange: movements.length,
        unitsAdded,
        unitsRemoved,
      },
      byCategory: [...categoryBuckets.values()].sort((a, b) => b.value - a.value),
      statusBreakdown: [...statusCounts.entries()].map(([status, value]) => ({
        label: STATUS_LABELS[status] ?? status,
        value,
      })),
      movementSeries: [...series.values()],
      movementReasons: [...reasonCounts.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value),
      topByValue: products
        .map((product) => ({
          name: product.name,
          sku: product.sku,
          value: Number(product.price) * product.stock_quantity,
          units: product.stock_quantity,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      lowStockRows: products
        .filter((product) => product.stock_quantity <= product.low_stock_threshold)
        .map((product) => ({
          name: product.name,
          sku: product.sku,
          stock: product.stock_quantity,
          threshold: product.low_stock_threshold,
        }))
        .sort((a, b) => a.stock - b.stock),
      recentActivity: ((activityRes.data ?? []) as AnalyticsActivity[]).map((row) => ({
        id: row.id,
        action: row.action,
        entity: row.entity,
        created_at: row.created_at,
        details: (row.details ?? {}) as Record<string, unknown>,
      })),
    };
  });
