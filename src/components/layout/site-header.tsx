import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SearchDialog } from "@/components/shop/search-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { listCategories } from "@/lib/catalog.functions";
import { useCartStore, useCartUi } from "@/stores/cart";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openCart = useCartUi((state) => state.open);
  const itemCount = useCartStore((state) =>
    state.lines.reduce((sum, line) => sum + line.quantity, 0),
  );

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <p className="container-page label-eyebrow py-2.5 text-center">
          Complimentary delivery on orders over $750
        </p>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur transition-shadow",
          scrolled && "shadow-soft",
        )}
      >
        <div className="container-page flex h-20 items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[86vw] max-w-sm p-0">
                <SheetHeader className="border-b border-border px-6 py-5">
                  <SheetTitle className="label-eyebrow text-muted-foreground">Menu</SheetTitle>
                </SheetHeader>
                <nav className="px-6 py-6">
                  <Link
                    to="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-display text-2xl"
                  >
                    All furniture
                  </Link>
                  <p className="label-eyebrow mt-6 text-muted-foreground">Categories</p>
                  <ul className="mt-3 space-y-1">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: category.slug }}
                          onClick={() => setMenuOpen(false)}
                          className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
                    <li>
                      <Link to="/about" onClick={() => setMenuOpen(false)}>
                        About Silvex
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" onClick={() => setMenuOpen(false)}>
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link to="/faq" onClick={() => setMenuOpen(false)}>
                        Delivery &amp; returns
                      </Link>
                    </li>
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>

            <Logo />
          </div>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            <Link to="/shop" className="label-eyebrow hover:text-accent" activeProps={{ className: "text-accent" }}>
              Shop
            </Link>
            <div className="group relative">
              <button type="button" className="label-eyebrow hover:text-accent">
                Categories
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <ul className="border border-border bg-popover p-2 shadow-lift">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        to="/category/$slug"
                        params={{ slug: category.slug }}
                        className="block px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link to="/about" className="label-eyebrow hover:text-accent">
              About
            </Link>
            <Link to="/contact" className="label-eyebrow hover:text-accent">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label={`Bag, ${itemCount} items`} onClick={openCart} className="relative">
              <ShoppingBag />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
