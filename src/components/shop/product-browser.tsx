import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";

import { ProductCard, ProductCardSkeleton } from "@/components/shop/product-card";
import { ProductFiltersPanel } from "@/components/shop/product-filters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { listProducts } from "@/lib/catalog.functions";
import {
  PRODUCTS_PER_PAGE,
  SORT_OPTIONS,
  type CatalogFacets,
  type Category,
  type ProductFilters,
  type SortKey,
} from "@/lib/catalog.types";

interface ProductBrowserProps {
  filters: ProductFilters;
  facets: CatalogFacets;
  categories: Category[];
  onChange: (next: Partial<ProductFilters>) => void;
  onReset: () => void;
  showCategoryFilter?: boolean;
}

export function ProductBrowser({
  filters,
  facets,
  categories,
  onChange,
  onReset,
  showCategoryFilter = true,
}: ProductBrowserProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => listProducts({ data: filters }),
  });

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? PRODUCTS_PER_PAGE;
  const totalPages = data ? Math.max(Math.ceil(data.total / perPage), 1) : 1;

  const panel = (
    <ProductFiltersPanel
      facets={facets}
      categories={categories}
      value={filters}
      onChange={onChange}
      onReset={onReset}
      showCategories={showCategoryFilter}
    />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
      <aside className="hidden lg:block">{panel}</aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">
            {isPending ? "Loading pieces…" : `${data?.total ?? 0} pieces`}
          </p>

          <div className="flex items-center gap-2">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal /> Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="label-eyebrow text-muted-foreground">Filter</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-10">{panel}</div>
              </SheetContent>
            </Sheet>

            <Select
              value={filters.sort ?? "featured"}
              onValueChange={(value) => onChange({ sort: value as SortKey })}
            >
              <SelectTrigger className="w-[190px]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError ? (
          <div className="py-24 text-center">
            <p className="text-base">We could not load the collection.</p>
            <p className="mt-2 text-sm text-muted-foreground">Please refresh and try again.</p>
          </div>
        ) : isPending ? (
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="display-md">Nothing matches those filters</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              Try widening the price range or clearing a material to see more of the collection.
            </p>
            <Button variant="outlineHero" size="editorial" className="mt-8" onClick={onReset}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
              {data?.items.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 3} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => onChange({ page: page - 1 })}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={page === index + 1 ? "default" : "ghost"}
                    size="icon"
                    onClick={() => onChange({ page: index + 1 })}
                    aria-current={page === index + 1 ? "page" : undefined}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => onChange({ page: page + 1 })}
                >
                  Next
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
