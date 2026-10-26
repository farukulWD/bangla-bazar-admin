import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return <Skeleton className="w-full rounded-lg" style={{ height }} />;
}

export function ChartEmpty({ message = "No data in this range" }: { message?: string }) {
  return (
    <div className="flex h-60 items-center justify-center rounded-lg border border-dashed">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function ChartError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40">
      <p className="text-sm text-muted-foreground">Could not load this section.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
