export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  // Back-office only fields; storefront queries do not select them.
  sort_order?: number;
  is_active?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category_id?: string;
  short_description: string | null;
  description: string;
  price: number;
  compare_at_price: number | null;
  collection: string | null;
  material: string | null;
  color: string | null;
  dimensions: string | null;
  weight_kg: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  status: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  rating: number;
  reviews_count: number;
  images: string[];
  categories: { slug: string; name: string } | null;
}

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling"
  | "rating";

export interface ProductFilters {
  category?: string | undefined;
  collection?: string | undefined;
  material?: string | undefined;
  color?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minRating?: number | undefined;
  inStock?: boolean | undefined;
  q?: string | undefined;
  sort?: SortKey | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
}

export interface CatalogFacets {
  materials: string[];
  colors: string[];
  collections: string[];
  minPrice: number;
  maxPrice: number;
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "best-selling", label: "Best selling" },
  { value: "rating", label: "Highest rated" },
];

export const PRODUCTS_PER_PAGE = 12;

export function isLowStock(product: Product): boolean {
  return product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
}

export function primaryImage(product: Product): string {
  return product.images[0] ?? "/images/hero-terrace.jpg";
}
