import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story | Silvex Furniture" },
      {
        name: "description",
        content:
          "Silvex is a small studio making outdoor furniture — lounge, dining and shade — in FSC teak and all-weather materials, in limited runs.",
      },
      { property: "og:title", content: "Our Story | Silvex Furniture" },
      { property: "og:description", content: "A small studio making outdoor furniture built to last." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <p className="label-eyebrow text-muted-foreground">Our story</p>
        <h1 className="display-lg mt-4">Outdoor furniture worth keeping.</h1>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Silvex began in a small joinery workshop with a simple frustration: most outdoor furniture
          is made to be replaced after two summers. We wanted the opposite — honest materials,
          repairable joinery and finishes that only look better as they weather.
        </p>
      </header>

      <img
        src="/images/hero-terrace.jpg"
        alt="A Silvex terrace setting with a woven outdoor lounge set and teak table"
        width={1920}
        height={1200}
        className="mt-12 aspect-[16/7] w-full object-cover"
      />

      <div className="mt-16 grid gap-12 md:grid-cols-3">
        <section>
          <h2 className="font-display text-xl">Materials first</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            FSC-certified teak, powder-coated marine-grade aluminium, hand-woven olefin rope and
            solution-dyed acrylic. We publish what everything is made from, because outdoors the
            material is the product.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl">Small runs</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Each design is produced in limited batches. It keeps quality controllable and means we
            can retire a piece rather than cheapen it.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl">Ten-year warranty</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Frames and joinery are covered for ten years. We stock spare parts so a single worn
            component never ends a piece's life.
          </p>
        </section>
      </div>

      <div className="mt-16 flex flex-wrap gap-3">
        <Button asChild variant="hero" size="editorial">
          <Link to="/shop">Shop the collection</Link>
        </Button>
        <Button asChild variant="outlineHero" size="editorial">
          <Link to="/contact">Talk to an advisor</Link>
        </Button>
      </div>
    </div>
  );
}
