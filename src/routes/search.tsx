import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ProductBrowser } from "@/components/shop/product-browser";
import { getCatalogFacets, listCategories } from "@/lib/catalog.functions";
import type { ProductFilters } from "@/lib/catalog.types";
import { cleanSearch, parseProductSearch } from "@/lib/search-params";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => parseProductSearch(search),
  loader: async () => {
    const [categories, facets] = await Promise.all([listCategories(), getCatalogFacets()]);
    return { categories, facets };
  },
  head: () => ({
    meta: [
      { title: "Search | Silvex Furniture" },
      {
        name: "description",
        content: "Search the Silvex Furniture collection by piece, material, colour or collection.",
      },
      { property: "og:title", content: "Search | Silvex Furniture" },
      { property: "og:description", content: "Find your next Silvex piece." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { categories, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  function update(next: Partial<ProductFilters>) {
    navigate({
      to: "/search",
      search: (prev) => cleanSearch({ ...prev, ...next, page: next.page ?? 1 }),
    });
  }

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="label-eyebrow text-muted-foreground">Search</p>
        <h1 className="display-lg mt-4">
          {search.q ? `Results for “${search.q}”` : "Search the collection"}
        </h1>
      </header>

      <div className="mt-12">
        <ProductBrowser
          filters={search}
          facets={facets}
          categories={categories}
          onChange={update}
          onReset={() => navigate({ to: "/search", search: search.q ? { q: search.q } : {} })}
        />
      </div>
    </div>
  );
}
