import type { ProductFilters, SortKey } from "./catalog.types";

const SORT_KEYS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "best-selling", "rating"];

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  const parsed = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Filters live in the URL so every listing view is shareable. */
export function parseProductSearch(raw: Record<string, unknown>): ProductFilters {
  const sort = optionalString(raw["sort"]);

  return {
    category: optionalString(raw["category"]),
    collection: optionalString(raw["collection"]),
    material: optionalString(raw["material"]),
    color: optionalString(raw["color"]),
    minPrice: optionalNumber(raw["minPrice"]),
    maxPrice: optionalNumber(raw["maxPrice"]),
    minRating: optionalNumber(raw["minRating"]),
    inStock: raw["inStock"] === true || raw["inStock"] === "true" ? true : undefined,
    q: optionalString(raw["q"]),
    sort: sort && SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : undefined,
    page: optionalNumber(raw["page"]),
  };
}

/** Drops empty values so the URL only carries meaningful filters. */
export function cleanSearch(filters: ProductFilters): ProductFilters {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || value === null) continue;
    next[key] = value;
  }
  return next as ProductFilters;
}
