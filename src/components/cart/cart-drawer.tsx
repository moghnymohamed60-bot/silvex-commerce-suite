import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { formatPrice } from "@/lib/format";
import { cartTotals, FREE_SHIPPING_THRESHOLD, useCartStore, useCartUi } from "@/stores/cart";

export function CartDrawer() {
  const { isOpen, setOpen, close } = useCartUi();
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const totals = cartTotals(lines);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="display-md">Your bag ({totals.itemCount})</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-8 text-muted-foreground" />
            <div>
              <p className="text-base">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore the collection and add pieces you love.
              </p>
            </div>
            <Button asChild variant="hero" size="editorial" onClick={close}>
              <Link to="/shop">Shop the collection</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-6 py-4">
              {totals.freeShippingRemaining > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {formatPrice(totals.freeShippingRemaining)} away from complimentary delivery
                </p>
              ) : (
                <p className="text-sm text-accent">Complimentary delivery unlocked</p>
              )}
              <Progress
                value={Math.min((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}
                className="mt-3 h-1"
              />
            </div>

            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-4 py-5">
                  <Link to="/product/$slug" params={{ slug: line.slug }} onClick={close}>
                    <img
                      src={line.image}
                      alt={line.name}
                      width={96}
                      height={96}
                      loading="lazy"
                      className="size-24 object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        to="/product/$slug"
                        params={{ slug: line.slug }}
                        onClick={close}
                        className="text-sm hover:text-accent"
                      >
                        {line.name}
                      </Link>
                      <span className="text-sm">{formatPrice(line.price * line.quantity)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{line.sku}</p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.name}`}
                          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.name}`}
                          className="p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                          disabled={line.quantity >= line.maxQuantity}
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => removeLine(line.productId)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-4 border-t border-border px-6 py-5">
              <dl className="space-y-2 text-sm">
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
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt>Total</dt>
                  <dd>{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              <Button asChild variant="hero" size="editorial" className="w-full" onClick={close}>
                <Link to="/cart">Review bag</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
