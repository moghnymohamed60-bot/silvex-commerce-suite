import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/catalog.functions";
import { formatPrice } from "@/lib/format";
import { cartTotals, useCartStore } from "@/stores/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag | Silvex Furniture" },
      { name: "description", content: "Review the pieces in your Silvex bag before checkout." },
      { property: "og:title", content: "Your Bag | Silvex Furniture" },
      { property: "og:description", content: "Review your Silvex selections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const totals = cartTotals(lines);

  const { data: recommended } = useQuery({
    queryKey: ["products", { sort: "best-selling", perPage: 4 }],
    queryFn: () => listProducts({ data: { sort: "best-selling", perPage: 4 } }),
  });

  return (
    <div className="container-page py-14">
      <h1 className="display-lg">Your bag</h1>

      {lines.length === 0 ? (
        <div className="mt-10 border border-border px-6 py-20 text-center">
          <h2 className="display-md">Nothing here yet</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Browse the collection and the pieces you add will appear here.
          </p>
          <Button asChild variant="hero" size="editorial" className="mt-8">
            <Link to="/shop">Shop the collection</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <li key={line.productId} className="flex flex-col gap-4 py-6 sm:flex-row">
                <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0">
                  <img
                    src={line.image}
                    alt={line.name}
                    width={160}
                    height={160}
                    loading="lazy"
                    className="size-32 object-cover sm:size-40"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <Link
                        to="/product/$slug"
                        params={{ slug: line.slug }}
                        className="text-base hover:text-accent"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">SKU {line.sku}</p>
                    </div>
                    <p className="text-base">{formatPrice(line.price * line.quantity)}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-6">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.name}`}
                        className="p-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.name}`}
                        className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                        disabled={line.quantity >= line.maxQuantity}
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeLine(line.productId)}
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
            <h2 className="label-eyebrow text-muted-foreground">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{totals.shipping === 0 ? "Complimentary" : formatPrice(totals.shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated tax</dt>
                <dd>{formatPrice(totals.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-display text-xl">
                <dt>Total</dt>
                <dd>{formatPrice(totals.total)}</dd>
              </div>
            </dl>

            <Button variant="hero" size="editorial" className="mt-6 w-full" disabled>
              Checkout
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Secure card payment is being connected. Your bag is saved on this device.
            </p>
          </aside>
        </div>
      )}

      {recommended && recommended.items.length > 0 && (
        <section className="mt-24">
          <h2 className="display-md">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {recommended.items.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
