import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SHOP_LINKS = [
  { label: "Lounge Sets", slug: "lounge-sets" },
  { label: "Outdoor Sofas", slug: "outdoor-sofas" },
  { label: "Outdoor Dining", slug: "outdoor-dining" },
  { label: "Sun Loungers", slug: "sun-loungers" },
  { label: "Parasols & Shade", slug: "parasols-shade" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Outdoor furniture made in small runs from FSC teak, hand-woven rope and marine-grade
            aluminium — designed to stay outside for decades.
          </p>
        </div>

        <nav aria-label="Shop">
          <h2 className="label-eyebrow text-muted-foreground">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {SHOP_LINKS.map((link) => (
              <li key={link.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: link.slug }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className="text-muted-foreground transition-colors hover:text-foreground">
                All outdoor furniture
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="label-eyebrow text-muted-foreground">Silvex</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-muted-foreground transition-colors hover:text-foreground">
                Delivery &amp; returns
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="label-eyebrow text-muted-foreground">The Silvex letter</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            New collections, workshop notes and private previews. Twice a month.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              event.currentTarget.reset();
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <Input id="newsletter-email" type="email" required placeholder="you@example.com" className="h-11" />
            <Button type="submit" variant="hero" className="h-11 px-5">
              Join
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Silvex Furniture. All rights reserved.</p>
          <p>Complimentary delivery on orders over $750 · 30-day returns</p>
        </div>
      </div>
    </footer>
  );
}
