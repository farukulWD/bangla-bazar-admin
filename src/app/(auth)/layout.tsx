import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-muted px-4 py-10">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShoppingBag className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="font-heading font-semibold">Bangla Bazar</p>
          <p className="text-xs text-muted-foreground">Admin panel</p>
        </div>
      </div>
      <div className="w-full max-w-md">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}
