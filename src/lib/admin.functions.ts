import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AdminSession, AppRole } from "@/lib/auth.types";
import { canManageCatalog, isStaff } from "@/lib/auth.types";
import type { Category, Product } from "@/lib/catalog.types";

const PRODUCT_COLUMNS =
  "id, slug, name, sku, description, short_description, price, compare_at_price, category_id, collection, material, color, dimensions, weight_kg, stock_quantity, low_stock_threshold, status, is_featured, is_bestseller, is_new_arrival, rating, reviews_count, images, created_at, updated_at";

type AuthedContext = {
  supabase: {
    from: (table: string) => any;
    rpc: (fn: string, args?: Record<string, unknown>) => any;
  };
  userId: string;
  claims: Record<string, unknown>;
};

async function loadRoles(context: AuthedContext): Promise<AppRole[]> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: { role: AppRole }) => row.role);
}

/** Every mutating function re-checks permissions server-side; the UI is only a hint. */
async function requireCatalogPermission(context: AuthedContext): Promise<AppRole[]> {
  const roles = await loadRoles(context);
  if (!canManageCatalog(roles)) {
    throw new Error("You do not have permission to change the catalogue.");
  }
  return roles;
}

async function requireStaff(context: AuthedContext): Promise<AppRole[]> {
  const roles = await loadRoles(context);
  if (!isStaff(roles)) throw new Error("This area is limited to Silvex staff accounts.");
  return roles;
}

async function writeAudit(
  context: AuthedContext,
  action: string,
  entity: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  await context.supabase.from("audit_logs").insert({
    actor_id: context.userId,
    action,
    entity,
    entity_id: entityId,
    details,
  });
}

export const getAdminSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminSession> => {
    const ctx = context as unknown as AuthedContext;
    const email = (ctx.claims["email"] as string | undefined) ?? null;

    // Keep a profile row in step with the auth account for staff listings.
    await ctx.supabase
      .from("profiles")
      .upsert({ id: ctx.userId, email }, { onConflict: "id" });

    const [{ data: profile }, roles] = await Promise.all([
      ctx.supabase.from("profiles").select("full_name").eq("id", ctx.userId).maybeSingle(),
      loadRoles(ctx),
    ]);

    let canClaimFirstAdmin = false;
    if (roles.length === 0) {
      const { count } = await ctx.supabase
        .from("user_roles")
        .select("id", { count: "exact", head: true });
      // RLS hides other people's rows, so a zero count only proves "none visible";
      // claim_first_admin() re-checks authoritatively before granting anything.
      canClaimFirstAdmin = (count ?? 0) === 0;
    }

    return {
      userId: ctx.userId,
      email,
      fullName: (profile?.full_name as string | undefined) ?? null,
      roles,
      canClaimFirstAdmin,
    };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ claimed: boolean }> => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase.rpc("claim_first_admin");
    if (error) throw new Error(error.message);
    if (data === true) {
      await writeAudit(ctx, "claim_first_admin", "user_role", ctx.userId);
    }
    return { claimed: data === true };
  });

/* ------------------------------- products -------------------------------- */

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  sku: z.string().trim().min(2).max(40),
  description: z.string().trim().max(4000).default(""),
  short_description: z.string().trim().max(300).nullable().default(null),
  price: z.number().nonnegative().max(1000000),
  compare_at_price: z.number().nonnegative().max(1000000).nullable().default(null),
  category_id: z.string().uuid(),
  collection: z.string().trim().max(80).nullable().default(null),
  material: z.string().trim().max(120).nullable().default(null),
  color: z.string().trim().max(80).nullable().default(null),
  dimensions: z.string().trim().max(160).nullable().default(null),
  weight_kg: z.number().nonnegative().max(2000).nullable().default(null),
  stock_quantity: z.number().int().min(0).max(100000),
  low_stock_threshold: z.number().int().min(0).max(1000),
  status: z.enum(["draft", "active", "archived", "out_of_stock"]),
  is_featured: z.boolean(),
  is_bestseller: z.boolean(),
  is_new_arrival: z.boolean(),
  images: z.array(z.string().trim().min(1).max(500)).max(8),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).optional(),
        status: z.enum(["draft", "active", "archived", "out_of_stock"]).optional(),
        categoryId: z.string().uuid().optional(),
        lowStockOnly: z.boolean().optional(),
      })
      .default({})
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }): Promise<Product[]> => {
    const ctx = context as unknown as AuthedContext;
    await requireStaff(ctx);

    let query = ctx.supabase
      .from("products")
      .select(`${PRODUCT_COLUMNS}, categories(id, slug, name)`)
      .order("updated_at", { ascending: false })
      .limit(200);

    if (data.search) query = query.or(`name.ilike.%${data.search}%,sku.ilike.%${data.search}%`);
    if (data.status) query = query.eq("status", data.status);
    if (data.categoryId) query = query.eq("category_id", data.categoryId);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const products = (rows ?? []) as unknown as Product[];
    return data.lowStockOnly
      ? products.filter((product) => product.stock_quantity <= product.low_stock_threshold)
      : products;
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ context, data }): Promise<Product> => {
    const ctx = context as unknown as AuthedContext;
    await requireCatalogPermission(ctx);

    const { id, ...fields } = data;
    const query = id
      ? ctx.supabase.from("products").update(fields).eq("id", id).select(PRODUCT_COLUMNS).single()
      : ctx.supabase.from("products").insert(fields).select(PRODUCT_COLUMNS).single();

    const { data: row, error } = await query;
    if (error) throw new Error(error.message);

    const product = row as unknown as Product;
    await writeAudit(ctx, id ? "product.updated" : "product.created", "product", product.id, {
      name: product.name,
      sku: product.sku,
      status: product.status,
    });
    return product;
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const ctx = context as unknown as AuthedContext;
    await requireCatalogPermission(ctx);

    const { error } = await ctx.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(ctx, "product.deleted", "product", data.id);
    return { ok: true };
  });

/* ------------------------------ categories ------------------------------- */

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  description: z.string().trim().max(1000).nullable().default(null),
  image_url: z.string().trim().max(500).nullable().default(null),
  sort_order: z.number().int().min(0).max(999),
  is_active: z.boolean(),
  seo_title: z.string().trim().max(120).nullable().default(null),
  seo_description: z.string().trim().max(200).nullable().default(null),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<(Category & { product_count: number })[]> => {
    const ctx = context as unknown as AuthedContext;
    await requireStaff(ctx);

    const [{ data: categories, error }, { data: products }] = await Promise.all([
      ctx.supabase
        .from("categories")
        .select(
          "id, slug, name, description, image_url, sort_order, is_active, seo_title, seo_description",
        )
        .order("sort_order"),
      ctx.supabase.from("products").select("category_id"),
    ]);
    if (error) throw new Error(error.message);

    const counts = new Map<string, number>();
    for (const row of (products ?? []) as { category_id: string }[]) {
      counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
    }

    return ((categories ?? []) as unknown as Category[]).map((category) => ({
      ...category,
      product_count: counts.get(category.id) ?? 0,
    }));
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => categorySchema.parse(input))
  .handler(async ({ context, data }): Promise<Category> => {
    const ctx = context as unknown as AuthedContext;
    await requireCatalogPermission(ctx);

    const { id, ...fields } = data;
    const query = id
      ? ctx.supabase.from("categories").update(fields).eq("id", id).select("*").single()
      : ctx.supabase.from("categories").insert(fields).select("*").single();

    const { data: row, error } = await query;
    if (error) throw new Error(error.message);

    const category = row as unknown as Category;
    await writeAudit(ctx, id ? "category.updated" : "category.created", "category", category.id, {
      name: category.name,
    });
    return category;
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const ctx = context as unknown as AuthedContext;
    await requireCatalogPermission(ctx);

    const { count } = await ctx.supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", data.id);
    if ((count ?? 0) > 0) {
      throw new Error("Move or delete this category's products before deleting it.");
    }

    const { error } = await ctx.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(ctx, "category.deleted", "category", data.id);
    return { ok: true };
  });

/* ------------------------------- inventory ------------------------------- */

export interface StockMovement {
  id: string;
  product_id: string;
  delta: number;
  reason: string;
  note: string | null;
  resulting_quantity: number;
  created_at: string;
  products?: { name: string; sku: string } | null;
}

export const adminListStockMovements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ productId: z.string().uuid().optional() })
      .default({})
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }): Promise<StockMovement[]> => {
    const ctx = context as unknown as AuthedContext;
    await requireStaff(ctx);

    let query = ctx.supabase
      .from("inventory_movements")
      .select("id, product_id, delta, reason, note, resulting_quantity, created_at, products(name, sku)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.productId) query = query.eq("product_id", data.productId);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as StockMovement[];
  });

export const adminAdjustStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        delta: z.number().int().refine((value) => value !== 0, "Enter a non-zero amount."),
        reason: z.enum(["restock", "adjustment", "damage", "return", "stocktake"]),
        note: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }): Promise<{ stock_quantity: number }> => {
    const ctx = context as unknown as AuthedContext;
    await requireCatalogPermission(ctx);

    const { data: product, error: readError } = await ctx.supabase
      .from("products")
      .select("id, name, sku, stock_quantity")
      .eq("id", data.productId)
      .single();
    if (readError) throw new Error(readError.message);

    const next = (product.stock_quantity as number) + data.delta;
    if (next < 0) throw new Error("That would take stock below zero.");

    const { error: updateError } = await ctx.supabase
      .from("products")
      .update({ stock_quantity: next })
      .eq("id", data.productId);
    if (updateError) throw new Error(updateError.message);

    const { error: movementError } = await ctx.supabase.from("inventory_movements").insert({
      product_id: data.productId,
      delta: data.delta,
      reason: data.reason,
      note: data.note ?? null,
      resulting_quantity: next,
      created_by: ctx.userId,
    });
    if (movementError) throw new Error(movementError.message);

    await writeAudit(ctx, "inventory.adjusted", "product", data.productId, {
      delta: data.delta,
      reason: data.reason,
      resulting_quantity: next,
    });

    return { stock_quantity: next };
  });
