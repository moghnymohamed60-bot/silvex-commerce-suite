import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";

import { ProductBrowser } from "@/components/shop/product-browser";
import { getCatalogFacets, getCategory, listCategories } from "@/lib/catalog.functions";
import type { ProductFilters } from "@/lib/catalog.types";
import { cleanSearch, parseProductSearch } from "@/lib/search-params";

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (search: Record<string, unknown>) => parseProductSearch(search),
  loader: async ({ params }) => {
    const [category, categories, facets] = await Promise.all([
      getCategory({ data: { slug: params.slug } }),
      listCategories(),
      getCatalogFacets(),
    ]);
    if (!category) throw notFound();
    return { category, categories, facets };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category.name ?? "Category";
    const description =
      loaderData?.category.description ?? `Shop ${name} from the Silvex Furniture collection.`;
    return {
      meta: [
        { title: `${name} | Silvex Furniture` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} | Silvex Furniture` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, categories, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const slug = category.slug;

  function update(next: Partial<ProductFilters>) {
    navigate({
      to: "/category/$slug",
      params: { slug },
      search: (prev) => cleanSearch({ ...prev, ...next, page: next.page ?? 1 }),
    });
  }

  return (
    <div className="container-page py-14">
      <nav aria-label="Breadcrumb" className="label-eyebrow text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/shop" className="hover:text-foreground">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{category.name}</li>
        </ol>
      </nav>

      <header className="mt-8 max-w-2xl">
        <h1 className="display-lg">{category.name}</h1>
        {category.description && (
          <p className="mt-4 text-sm text-muted-foreground">{category.description}</p>
        )}
      </header>

      <div className="mt-12">
        <ProductBrowser
          filters={{ ...search, category: slug }}
          facets={facets}
          categories={categories}
          showCategoryFilter={false}
          onChange={update}
          onReset={() => navigate({ to: "/category/$slug", params: { slug }, search: {} })}
        />
      </div>
    </div>
  );
}
