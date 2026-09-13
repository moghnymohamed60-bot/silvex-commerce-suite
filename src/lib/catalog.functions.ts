import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type {
  CatalogFacets,
  Category,
  Product,
  ProductFilters,
  ProductListResult,
  SortKey,
} from "./catalog.types";
import { PRODUCTS_PER_PAGE } from "./catalog.types";

const PRODUCT_COLUMNS =
  "id, slug, name, sku, short_description, description, price, compare_at_price, collection, material, color, dimensions, weight_kg, stock_quantity, low_stock_threshold, status, is_featured, is_bestseller, is_new_arrival, rating, reviews_count, images, categories!inner(slug, name)";

const VISIBLE_STATUSES = ["active", "out_of_stock"];

/**
 * Publishable-key client for public catalog reads. Created per request because
 * env vars are only injected at call time on the edge runtime.
 */
function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        // Opaque sb_ keys are not JWTs; PostgREST rejects them as bearer tokens.
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

type ProductQuery = ReturnType<ReturnType<typeof publicClient>["from"]>;

function applySort(query: any, sort: SortKey | undefined) {
  switch (sort) {
    case "newest":
      return query.order("created_at", { ascending: false });
    case "price-asc":
      return query.order("price", { ascending: true });
    case "price-desc":
      return query.order("price", { ascending: false });
    case "best-selling":
      return query.order("reviews_count", { ascending: false });
    case "rating":
      return query.order("rating", { ascending: false });
    default:
      return query
        .order("is_featured", { ascending: false })
        .order("is_bestseller", { ascending: false })
        .order("created_at", { ascending: false });
  }
}

export const listCategories = createServerFn({ method: "GET" }).handler(async (): Promise<Category[]> => {
  const { data, error } = await publicClient()
    .from("categories")
    .select("id, slug, name, description, image_url")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Category[];
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: ProductFilters) => input ?? {})
  .handler(async ({ data }): Promise<ProductListResult> => {
    const perPage = Math.min(Math.max(data.perPage ?? PRODUCTS_PER_PAGE, 1), 48);
    const page = Math.max(data.page ?? 1, 1);
    const from = (page - 1) * perPage;

    let query: any = publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS, { count: "exact" })
      .in("status", VISIBLE_STATUSES);

    if (data.category) query = query.eq("categories.slug", data.category);
    if (data.collection) query = query.eq("collection", data.collection);
    if (data.material) query = query.ilike("material", `%${data.material}%`);
    if (data.color) query = query.ilike("color", `%${data.color}%`);
    if (typeof data.minPrice === "number") query = query.gte("price", data.minPrice);
    if (typeof data.maxPrice === "number") query = query.lte("price", data.maxPrice);
    if (typeof data.minRating === "number") query = query.gte("rating", data.minRating);
    if (data.inStock) query = query.gt("stock_quantity", 0);
    if (data.q && data.q.trim()) {
      query = query.textSearch("search_vector", data.q.trim(), { type: "websearch" });
    }

    const { data: rows, count, error } = await applySort(query, data.sort).range(from, from + perPage - 1);
    if (error) throw new Error(error.message);

    return {
      items: (rows ?? []) as unknown as Product[],
      total: count ?? 0,
      page,
      perPage,
    };
  });

export const getCatalogFacets = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogFacets> => {
  const { data, error } = await publicClient()
    .from("products")
    .select("material, color, collection, price")
    .in("status", VISIBLE_STATUSES);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as { material: string | null; color: string | null; collection: string | null; price: number }[];
  const materials = new Set<string>();
  const colors = new Set<string>();
  const collections = new Set<string>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  for (const row of rows) {
    row.material
      ?.split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => materials.add(part));
    row.color
      ?.split("/")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => colors.add(part));
    if (row.collection) collections.add(row.collection);
    minPrice = Math.min(minPrice, Number(row.price));
    maxPrice = Math.max(maxPrice, Number(row.price));
  }

  return {
    materials: [...materials].sort((a, b) => a.localeCompare(b)),
    colors: [...colors].sort((a, b) => a.localeCompare(b)),
    collections: [...collections].sort((a, b) => a.localeCompare(b)),
    minPrice: Number.isFinite(minPrice) ? Math.floor(minPrice) : 0,
    maxPrice: Math.ceil(maxPrice),
  };
});

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<Category | null> => {
    const { data: row, error } = await publicClient()
      .from("categories")
      .select("id, slug, name, description, image_url")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (row ?? null) as unknown as Category | null;
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<{ product: Product; related: Product[] } | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .in("status", VISIBLE_STATUSES)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return null;

    const product = row as unknown as Product;
    const { data: relatedRows } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .in("status", VISIBLE_STATUSES)
      .eq("categories.slug", product.categories?.slug ?? "")
      .neq("slug", product.slug)
      .limit(4);

    return { product, related: (relatedRows ?? []) as unknown as Product[] };
  });

export const getHomepage = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    categories: Category[];
    featured: Product[];
    bestsellers: Product[];
    newArrivals: Product[];
  }> => {
    const supabase = publicClient();

    const [categories, featured, bestsellers, newArrivals] = await Promise.all([
      supabase.from("categories").select("id, slug, name, description, image_url").order("sort_order"),
      supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .in("status", VISIBLE_STATUSES)
        .eq("is_featured", true)
        .limit(4),
      supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .in("status", VISIBLE_STATUSES)
        .eq("is_bestseller", true)
        .order("reviews_count", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .in("status", VISIBLE_STATUSES)
        .eq("is_new_arrival", true)
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

    return {
      categories: (categories.data ?? []) as unknown as Category[],
      featured: (featured.data ?? []) as unknown as Product[],
      bestsellers: (bestsellers.data ?? []) as unknown as Product[],
      newArrivals: (newArrivals.data ?? []) as unknown as Product[],
    };
  },
);

export const suggestProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string }) => input)
  .handler(async ({ data }): Promise<{ products: Product[]; categories: Category[] }> => {
    const term = data.q.trim();
    if (term.length < 2) return { products: [], categories: [] };

    const supabase = publicClient();
    const [products, categories] = await Promise.all([
      supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .in("status", VISIBLE_STATUSES)
        .or(`name.ilike.%${term}%,material.ilike.%${term}%,collection.ilike.%${term}%`)
        .limit(6),
      supabase
        .from("categories")
        .select("id, slug, name, description, image_url")
        .ilike("name", `%${term}%`)
        .limit(4),
    ]);

    return {
      products: (products.data ?? []) as unknown as Product[],
      categories: (categories.data ?? []) as unknown as Category[],
    };
  });

export type { ProductQuery };
