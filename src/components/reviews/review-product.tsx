import { cn } from "cn";
import { Package } from "lucide-react";

import type { ReviewProduct as ReviewProductData } from "@/store/api/review/types";

type ReviewProductProps = {
  product: ReviewProductData | null;
  className?: string;
};

export function ReviewProduct({ product, className }: ReviewProductProps) {
  const image = product?.images?.[0];
  const missing = !product || product.isDeleted;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40 text-muted-foreground">
        {image && !missing ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <Package aria-hidden className="size-4" />
        )}
      </div>
      <span className={cn("truncate font-medium", missing && "text-muted-foreground italic")}>
        {missing ? "Deleted product" : product.title}
      </span>
    </div>
  );
}
