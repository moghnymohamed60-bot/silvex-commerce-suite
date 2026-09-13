import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group inline-flex flex-col leading-none", className)} aria-label="Silvex Furniture home">
      <span className="font-display text-2xl tracking-[0.32em] uppercase">Silvex</span>
      <span className="label-eyebrow mt-1 text-muted-foreground">Furniture</span>
    </Link>
  );
}
