import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  count?: number;
  className?: string;
}

export function RatingStars({ rating, count, className }: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <Star
            key={step}
            className={cn(
              "size-3.5",
              step <= Math.round(rating) ? "fill-brass text-brass" : "text-border",
            )}
          />
        ))}
      </div>
      <span className="sr-only">{rating} out of 5 stars</span>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
