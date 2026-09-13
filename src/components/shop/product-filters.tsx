import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CatalogFacets, Category, ProductFilters } from "@/lib/catalog.types";

export interface FilterState {
  category?: string | undefined;
  material?: string | undefined;
  color?: string | undefined;
  collection?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minRating?: number | undefined;
  inStock?: boolean | undefined;
}

interface ProductFiltersPanelProps {
  facets: CatalogFacets;
  categories: Category[];
  value: FilterState;
  onChange: (next: Partial<ProductFilters>) => void;
  onReset: () => void;
  showCategories?: boolean;
}

const RATINGS = [4, 3];

export function ProductFiltersPanel({
  facets,
  categories,
  value,
  onChange,
  onReset,
  showCategories = true,
}: ProductFiltersPanelProps) {
  const activeCount = [
    value.category,
    value.material,
    value.color,
    value.collection,
    value.minPrice,
    value.maxPrice,
    value.minRating,
    value.inStock ? "yes" : undefined,
  ].filter((entry) => entry !== undefined && entry !== "").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="label-eyebrow text-muted-foreground">Filter</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Clear ({activeCount})
          </button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["category", "price", "material"]}
        className="border-t border-border"
      >
        {showCategories && (
          <AccordionItem value="category">
            <AccordionTrigger className="label-eyebrow">Category</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pb-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          category: value.category === category.slug ? undefined : category.slug,
                        })
                      }
                      className={
                        value.category === category.slug
                          ? "text-sm text-accent"
                          : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                      }
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="price">
          <AccordionTrigger className="label-eyebrow">Price</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-end gap-3 pb-2">
              <div className="flex-1">
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                  Min
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={String(facets.minPrice)}
                  value={value.minPrice ?? ""}
                  onChange={(event) =>
                    onChange({ minPrice: event.target.value ? Number(event.target.value) : undefined })
                  }
                  className="mt-1 h-10"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                  Max
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={String(facets.maxPrice)}
                  value={value.maxPrice ?? ""}
                  onChange={(event) =>
                    onChange({ maxPrice: event.target.value ? Number(event.target.value) : undefined })
                  }
                  className="mt-1 h-10"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="material">
          <AccordionTrigger className="label-eyebrow">Material</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pb-2">
              {facets.materials.map((material) => (
                <li key={material}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ material: value.material === material ? undefined : material })
                    }
                    className={
                      value.material === material
                        ? "text-left text-sm text-accent"
                        : "text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {material}
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger className="label-eyebrow">Colour</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pb-2">
              {facets.colors.map((color) => (
                <li key={color}>
                  <button
                    type="button"
                    onClick={() => onChange({ color: value.color === color ? undefined : color })}
                    className={
                      value.color === color
                        ? "text-sm text-accent"
                        : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {color}
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="collection">
          <AccordionTrigger className="label-eyebrow">Collection</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pb-2">
              {facets.collections.map((collection) => (
                <li key={collection}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ collection: value.collection === collection ? undefined : collection })
                    }
                    className={
                      value.collection === collection
                        ? "text-sm text-accent"
                        : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {collection}
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger className="label-eyebrow">Rating</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pb-2">
              {RATINGS.map((rating) => (
                <li key={rating}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ minRating: value.minRating === rating ? undefined : rating })
                    }
                    className={
                      value.minRating === rating
                        ? "text-sm text-accent"
                        : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {rating} stars &amp; up
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger className="label-eyebrow">Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2 pb-2">
              <Checkbox
                id="in-stock"
                checked={Boolean(value.inStock)}
                onCheckedChange={(checked) => onChange({ inStock: checked ? true : undefined })}
              />
              <Label htmlFor="in-stock" className="text-sm text-muted-foreground">
                In stock only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeCount > 0 && (
        <Button variant="outlineHero" size="editorial" className="w-full" onClick={onReset}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
