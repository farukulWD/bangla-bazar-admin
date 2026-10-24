import Link from "next/link";
import { cn } from "cn";

import { CUSTOMIZATION_PAGES } from "./pages-config";

export function CustomizationTabs({ active }: { active: string }) {
  return (
    <nav
      aria-label="Customization pages"
      className="-mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      <ul className="flex w-max gap-1 rounded-lg bg-muted p-1">
        {CUSTOMIZATION_PAGES.map((page) => (
          <li key={page.key}>
            <Link
              href={`/store/customization/${page.key}`}
              aria-current={page.key === active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                page.key === active && "bg-background text-foreground shadow-sm",
              )}
            >
              {page.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
