import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type BulkActionBarProps = {
  count: number;
  noun: string;
  onClear: () => void;
  children: React.ReactNode;
};

export function BulkActionBar({
  count,
  noun,
  onClear,
  children,
}: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/50 px-4 py-2 text-sm">
      <span className="font-medium">
        {count} {noun}
        {count === 1 ? "" : "s"} selected
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <X />
      </Button>
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
