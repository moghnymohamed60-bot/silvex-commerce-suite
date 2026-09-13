import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, Headphones, Leaf, Lock, Truck } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { getHomepage } from "@/lib/catalog.functions";

export const Route = createFileRoute("/")({
  loader: () => getHomepage(),
  head: () => ({
    meta: [
      { title: "Silvex Furniture | Furniture That Defines Your Space" },
      {
        name: "description",
        content:
          "Silvex crafts premium furniture in solid timber, natural linen and full-grain leather — sofas, beds, dining and outdoor pieces made in small runs.",
      },
      { property: "og:title", content: "Silvex Furniture | Furniture That Defines Your Space" },
      {
        property: "og:description",
        content: "Premium, small-run furniture for considered interiors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const PROMISES = [
  { icon: Leaf, title: "Premium materials", copy: "Kiln-dried hardwood, natural linen and full-grain leather." },
  { icon: Hammer, title: "Expert craftsmanship", copy: "Joinery by hand in small batches, never mass produced." },
  { icon: Lock, title: "Secure checkout", copy: "Encrypted card payment and privacy-first ordering." },
  { icon: Truck, title: "White-glove delivery", copy: "Placed in the room of your choice, packaging removed." },
  { icon: Headphones, title: "Real support", copy: "Talk to a design advisor before and after you buy." },
];

const TESTIMONIALS = [
  {
    quote:
      "The Halden sofa completely changed our living room. The linen is substantial and the frame feels like it will outlive us.",
    name: "Elena R.",
    detail: "Halden Three-Seat Sofa",
  },
  {
    quote:
      "Delivery was faultless — two people, in and out in twenty minutes, and they took the packaging with them.",
    name: "Marcus D.",
    detail: "Otto Oak Dining Table",
  },
  {
    quote:
      "I compared it against pieces at three times the price. Silvex won on the details you actually touch.",
    name: "Priya N.",
    detail: "Sereno Walnut Bed",
  },
];

function HomePage() {
  const { categories, featured, bestsellers, newArrivals } = Route.useLoaderData();

  return (
    <div>
      <section className="relative">
        <div className="relative min-h-[78vh] overflow-hidden">
          <img
            src="/images/hero-living-room.jpg"
            alt="A sunlit living room with a linen sofa, oak coffee table and ceramic vase"
            width={1920}
            height={1200}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/35" />
          <div className="container-page relative flex min-h-[78vh] flex-col justify-end pb-16 pt-32">
            <p className="label-eyebrow text-background/80">New season · 2026</p>
            <h1 className="display-xl mt-5 max-w-3xl text-background">
              Furniture That Defines Your Space.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-background/85">
              Considered pieces made in small runs from solid timber, natural fibres and full-grain
              leather — designed to be lived with for decades.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="editorial">
                <Link to="/shop">Shop Collection</Link>
              </Button>
              <Button asChild variant="outlineHero" size="editorial" className="border-background/70 text-background hover:bg-background hover:text-foreground">
                <Link to="/shop" search={{ sort: "newest" }}>
                  Explore New Arrivals
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-eyebrow text-muted-foreground">Shop by room</p>
            <h2 className="display-md mt-3">Featured categories</h2>
          </div>
          <Link to="/shop" className="link-underline text-sm">
            View everything
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="group relative overflow-hidden bg-surface"
            >
              <img
                src={category.image_url ?? "/images/hero-living-room.jpg"}
                alt={category.name}
                width={800}
                height={600}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-5">
                <h3 className="font-display text-xl text-background">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-y border-border bg-surface py-20">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label-eyebrow text-muted-foreground">The edit</p>
                <h2 className="display-md mt-3">Featured collection</h2>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {bestsellers.length > 0 && (
        <section className="container-page py-20">
          <p className="label-eyebrow text-muted-foreground">Most loved</p>
          <h2 className="display-md mt-3">Best sellers</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-20">
        <div className="grid items-center gap-10 border border-border bg-surface p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="label-eyebrow text-accent">Studio offer</p>
            <h2 className="display-md mt-4">Up to 20% off selected dining</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              A small number of oak and walnut dining pieces are marked down while this season's
              batch lasts. Once they are gone, they are gone.
            </p>
            <Button asChild variant="brass" size="editorial" className="mt-8">
              <Link to="/category/$slug" params={{ slug: "dining-tables" }}>
                Shop dining
              </Link>
            </Button>
          </div>
          <img
            src="/images/products/otto-dining-table.jpg"
            alt="Solid oak dining table in a bright room"
            width={900}
            height={700}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="container-page pb-20">
          <p className="label-eyebrow text-muted-foreground">Just landed</p>
          <h2 className="display-md mt-3">New arrivals</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-border py-20">
        <div className="container-page">
          <p className="label-eyebrow text-muted-foreground">Why Silvex?</p>
          <h2 className="display-md mt-3 max-w-xl">Built properly, delivered properly.</h2>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {PROMISES.map(({ icon: Icon, title, copy }) => (
              <li key={title}>
                <Icon className="size-5 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-sm font-medium tracking-wide">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-20">
        <p className="label-eyebrow text-muted-foreground">From our customers</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="border border-border p-8">
              <blockquote className="font-display text-lg leading-relaxed">“{item.quote}”</blockquote>
              <figcaption className="mt-6 text-xs text-muted-foreground">
                {item.name} · {item.detail}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
