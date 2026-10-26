import { cn } from "cn";
import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  className?: string;
};

export function RatingStars({ rating, className }: RatingStarsProps) {
  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            "size-3.5",
            index < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}
