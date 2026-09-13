import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ProductBrowser } from "@/components/shop/product-browser";
import { getCatalogFacets, listCategories } from "@/lib/catalog.functions";
import type { ProductFilters } from "@/lib/catalog.types";
import { cleanSearch, parseProductSearch } from "@/lib/search-params";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => parseProductSearch(search),
  loader: async () => {
    const [categories, facets] = await Promise.all([listCategories(), getCatalogFacets()]);
    return { categories, facets };
  },
  head: () => ({
    meta: [
      { title: "Shop All Furniture | Silvex Furniture" },
      {
        name: "description",
        content:
          "Browse the full Silvex collection — sofas, beds, dining, office and outdoor furniture in solid oak, linen, marble and full-grain leather.",
      },
      { property: "og:title", content: "Shop All Furniture | Silvex Furniture" },
      {
        property: "og:description",
        content: "Filter the Silvex collection by room, material, colour and price.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { categories, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  function update(next: Partial<ProductFilters>) {
    navigate({
      to: "/shop",
      search: (prev) => cleanSearch({ ...prev, ...next, page: next.page ?? 1 }),
    });
  }

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="label-eyebrow text-muted-foreground">The collection</p>
        <h1 className="display-lg mt-4">All furniture</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Every Silvex piece is made in small runs from solid timber, natural fibres and full-grain
          leather. Filter by room, material or price to find yours.
        </p>
      </header>

      <div className="mt-12">
        <ProductBrowser
          filters={search}
          facets={facets}
          categories={categories}
          onChange={update}
          onReset={() => navigate({ to: "/shop", search: {} })}
        />
      </div>
    </div>
  );
}
