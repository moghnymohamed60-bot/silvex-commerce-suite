import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { suggestProducts } from "@/lib/catalog.functions";
import { formatPrice } from "@/lib/format";
import { primaryImage } from "@/lib/catalog.types";

const RECENT_KEY = "silvex-recent-searches";
const POPULAR = ["Lounge set", "Teak dining", "Sun lounger", "Parasol", "Fire pit"];

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(term: string) {
  const next = [term, ...readRecent().filter((item) => item !== term)].slice(0, 5);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["suggest", term],
    queryFn: () => suggestProducts({ data: { q: term } }),
    enabled: open && term.trim().length >= 2,
    staleTime: 30_000,
  });

  function submit(value: string) {
    const query = value.trim();
    if (!query) return;
    pushRecent(query);
    onOpenChange(false);
    setTerm("");
    navigate({ to: "/search", search: { q: query } });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogTitle className="sr-only">Search the Silvex collection</DialogTitle>
        <form
          className="flex items-center gap-3 border-b border-border px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit(term);
          }}
        >
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search lounge sets, teak dining, parasols…"
            aria-label="Search products"
            className="h-8 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close search">
            <X />
          </Button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {term.trim().length < 2 ? (
            <div className="space-y-6">
              {recent.length > 0 && (
                <section>
                  <h3 className="label-eyebrow text-muted-foreground">Recent searches</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recent.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => submit(item)}
                        className="border border-border px-3 py-1.5 text-sm transition-colors hover:border-foreground"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h3 className="label-eyebrow text-muted-foreground">Popular searches</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {POPULAR.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => submit(item)}
                      className="border border-border px-3 py-1.5 text-sm transition-colors hover:border-foreground"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : isFetching && !data ? (
            <p className="text-sm text-muted-foreground">Searching…</p>
          ) : (data?.products.length ?? 0) === 0 && (data?.categories.length ?? 0) === 0 ? (
            <div className="py-6 text-center">
              <p className="text-base">No matches for “{term}”.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a material, a range or a collection name.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {(data?.categories.length ?? 0) > 0 && (
                <section>
                  <h3 className="label-eyebrow text-muted-foreground">Categories</h3>
                  <ul className="mt-3 space-y-1">
                    {data?.categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: category.slug }}
                          onClick={() => onOpenChange(false)}
                          className="block py-1.5 text-sm hover:text-accent"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(data?.products.length ?? 0) > 0 && (
                <section>
                  <h3 className="label-eyebrow text-muted-foreground">Products</h3>
                  <ul className="mt-3 divide-y divide-border">
                    {data?.products.map((product) => (
                      <li key={product.id}>
                        <Link
                          to="/product/$slug"
                          params={{ slug: product.slug }}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center gap-4 py-3"
                        >
                          <img
                            src={primaryImage(product)}
                            alt={product.name}
                            width={64}
                            height={64}
                            loading="lazy"
                            className="size-16 object-cover"
                          />
                          <span className="flex-1 text-sm">{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatPrice(Number(product.price))}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <Button variant="outlineHero" size="editorial" className="w-full" onClick={() => submit(term)}>
                View all results
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
