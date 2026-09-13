import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/shop/rating-stars";
import { discountPercent, formatPrice } from "@/lib/format";
import { isLowStock, primaryImage, type Product } from "@/lib/catalog.types";
import { useCartStore, useCartUi } from "@/stores/cart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const addLine = useCartStore((state) => state.addLine);
  const openCart = useCartUi((state) => state.open);
  const saving = discountPercent(Number(product.price), product.compare_at_price ? Number(product.compare_at_price) : null);
  const soldOut = product.stock_quantity === 0;

  function handleAdd() {
    addLine(product, 1);
    openCart();
    toast.success(`${product.name} added to your bag`);
  }

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative overflow-hidden bg-surface">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <img
            src={primaryImage(product)}
            alt={product.name}
            width={1200}
            height={1200}
            loading={priority ? "eager" : "lazy"}
            className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
          {product.is_new_arrival && (
            <span className="label-eyebrow bg-background/90 px-2.5 py-1.5 text-foreground">New</span>
          )}
          {saving !== null && (
            <span className="label-eyebrow bg-accent px-2.5 py-1.5 text-accent-foreground">
              {saving}% off
            </span>
          )}
          {soldOut && (
            <span className="label-eyebrow bg-ink px-2.5 py-1.5 text-ink-foreground">Sold out</span>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
          <Button
            variant="hero"
            size="editorial"
            className="w-full"
            onClick={handleAdd}
            disabled={soldOut}
          >
            <ShoppingBag />
            {soldOut ? "Sold out" : "Add to bag"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base leading-snug">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-accent">
              {product.name}
            </Link>
          </h3>
          <div className="text-right">
            <p className="text-base">{formatPrice(Number(product.price))}</p>
            {product.compare_at_price && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(Number(product.compare_at_price))}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{product.material}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <RatingStars rating={Number(product.rating)} count={product.reviews_count} />
          {isLowStock(product) && (
            <span className="label-eyebrow text-accent">Only {product.stock_quantity} left</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square w-full animate-pulse bg-surface" />
      <div className="h-4 w-2/3 animate-pulse bg-surface" />
      <div className="h-3 w-1/3 animate-pulse bg-surface" />
    </div>
  );
}
