import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Check, Minus, Plus, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { ProductCard } from "@/components/shop/product-card";
import { RatingStars } from "@/components/shop/rating-stars";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProduct } from "@/lib/catalog.functions";
import { isLowStock, primaryImage } from "@/lib/catalog.types";
import { discountPercent, formatPrice } from "@/lib/format";
import { useCartStore, useCartUi } from "@/stores/cart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const result = await getProduct({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return {};
    const description =
      product.short_description ?? product.description.slice(0, 155);

    return {
      meta: [
        { title: `${product.name} | Silvex Furniture` },
        { name: "description", content: description },
        { property: "og:title", content: `${product.name} | Silvex Furniture` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.sku,
            description,
            material: product.material,
            color: product.color,
            brand: { "@type": "Brand", name: "Silvex Furniture" },
            aggregateRating:
              product.reviews_count > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: product.rating,
                    reviewCount: product.reviews_count,
                  }
                : undefined,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "USD",
              availability:
                product.stock_quantity > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const navigate = useNavigate();
  const addLine = useCartStore((state) => state.addLine);
  const openCart = useCartUi((state) => state.open);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const images = product.images.length > 0 ? product.images : [primaryImage(product)];
  const soldOut = product.stock_quantity === 0;
  const saving = discountPercent(
    Number(product.price),
    product.compare_at_price ? Number(product.compare_at_price) : null,
  );

  function addToBag(openDrawer = true) {
    addLine(product, quantity);
    if (openDrawer) openCart();
    toast.success(`${product.name} added to your bag`);
  }

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="label-eyebrow text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {product.categories && (
            <>
              <li>
                <Link
                  to="/category/$slug"
                  params={{ slug: product.categories.slug }}
                  className="hover:text-foreground"
                >
                  {product.categories.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <div
            className="relative overflow-hidden bg-surface"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
          >
            <img
              src={images[activeImage] ?? images[0]}
              alt={product.name}
              width={1200}
              height={1200}
              className={cn(
                "aspect-square w-full object-cover transition-transform duration-700",
                zoomed && "scale-110",
              )}
            />
            {saving !== null && (
              <span className="label-eyebrow absolute left-4 top-4 bg-accent px-2.5 py-1.5 text-accent-foreground">
                {saving}% off
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    "size-20 overflow-hidden border",
                    index === activeImage ? "border-foreground" : "border-border",
                  )}
                >
                  <img src={image} alt="" width={160} height={160} loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.collection && (
            <p className="label-eyebrow text-muted-foreground">{product.collection} collection</p>
          )}
          <h1 className="display-lg mt-3">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingStars rating={Number(product.rating)} count={product.reviews_count} />
            <span className="text-xs text-muted-foreground">SKU {product.sku}</span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-3xl">{formatPrice(Number(product.price))}</p>
            {product.compare_at_price && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(Number(product.compare_at_price))}
              </p>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <dl className="mt-8 grid gap-4 border-y border-border py-6 text-sm sm:grid-cols-2">
            {product.material && (
              <div>
                <dt className="label-eyebrow text-muted-foreground">Materials</dt>
                <dd className="mt-1.5">{product.material}</dd>
              </div>
            )}
            {product.dimensions && (
              <div>
                <dt className="label-eyebrow text-muted-foreground">Dimensions</dt>
                <dd className="mt-1.5">{product.dimensions}</dd>
              </div>
            )}
            {product.color && (
              <div>
                <dt className="label-eyebrow text-muted-foreground">Finish</dt>
                <dd className="mt-1.5">{product.color}</dd>
              </div>
            )}
            {product.weight_kg && (
              <div>
                <dt className="label-eyebrow text-muted-foreground">Weight</dt>
                <dd className="mt-1.5">{Number(product.weight_kg)} kg</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex items-center gap-3 text-sm">
            {soldOut ? (
              <span className="text-muted-foreground">Currently sold out</span>
            ) : isLowStock(product) ? (
              <span className="text-accent">Only {product.stock_quantity} left in stock</span>
            ) : (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Check className="size-4" /> In stock, ready to ship
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="px-3 text-muted-foreground hover:text-foreground disabled:opacity-40"
                disabled={quantity >= Math.max(product.stock_quantity, 1)}
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              variant="hero"
              size="editorial"
              className="flex-1"
              disabled={soldOut}
              onClick={() => addToBag()}
            >
              {soldOut ? "Sold out" : "Add to bag"}
            </Button>
            <Button
              variant="outlineHero"
              size="editorial"
              className="flex-1"
              disabled={soldOut}
              onClick={() => {
                addToBag(false);
                navigate({ to: "/cart" });
              }}
            >
              Buy now
            </Button>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Truck className="size-4" /> Complimentary white-glove delivery over $750
            </li>
            <li className="flex items-center gap-3">
              <Undo2 className="size-4" /> 30-day returns on undamaged pieces
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-4" /> Ten-year frame and joinery warranty
            </li>
          </ul>

          <Accordion type="single" collapsible className="mt-8 border-t border-border">
            <AccordionItem value="specs">
              <AccordionTrigger className="label-eyebrow">Specifications</AccordionTrigger>
              <AccordionContent>
                <dl className="space-y-2 pb-2 text-sm">
                  <div className="flex justify-between gap-6">
                    <dt className="text-muted-foreground">SKU</dt>
                    <dd>{product.sku}</dd>
                  </div>
                  {product.dimensions && (
                    <div className="flex justify-between gap-6">
                      <dt className="text-muted-foreground">Dimensions</dt>
                      <dd className="text-right">{product.dimensions}</dd>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex justify-between gap-6">
                      <dt className="text-muted-foreground">Materials</dt>
                      <dd className="text-right">{product.material}</dd>
                    </div>
                  )}
                  {product.collection && (
                    <div className="flex justify-between gap-6">
                      <dt className="text-muted-foreground">Collection</dt>
                      <dd>{product.collection}</dd>
                    </div>
                  )}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger className="label-eyebrow">Delivery &amp; returns</AccordionTrigger>
              <AccordionContent>
                <p className="pb-2 text-sm text-muted-foreground">
                  Larger pieces are delivered by our two-person team, unpacked and positioned on the terrace
                  of your choice. Standard lead time is 2–4 weeks. Returns are accepted within 30 days
                  of delivery on undamaged pieces.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger className="label-eyebrow">Care</AccordionTrigger>
              <AccordionContent>
                <p className="pb-2 text-sm text-muted-foreground">
                  Rinse teak and brush with mild soapy water twice a year, or re-oil each spring. Hose
                  setting and rotate cushions monthly. Keep pieces out of direct sunlight to preserve
                  colour.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display-md">Pairs well with</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
