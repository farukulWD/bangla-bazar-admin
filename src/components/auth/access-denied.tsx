import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";

type AccessDeniedProps = {
  message?: string;
};

export function AccessDenied({
  message = "Your role does not include permission to view this page. Ask a super admin if you need access.",
}: AccessDeniedProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX aria-hidden className="size-6" />
      </div>
      <div className="max-w-sm space-y-1">
        <h1 className="font-heading text-xl font-semibold">
          You don&apos;t have access to this page
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button render={<Link href="/dashboard" />} nativeButton={false}>
        Back to dashboard
      </Button>
    </div>
  );
}
