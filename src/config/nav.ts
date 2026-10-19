import {
  Boxes,
  LayoutGrid,
  type LucideIcon,
  Settings,
  ShoppingCart,
  Store,
  UserCog,
  Users,
} from "lucide-react";

export type NavLink = {
  title: string;
  href: string;
  external?: boolean;
};

export type NavItem =
  | (NavLink & { icon: LucideIcon; items?: never })
  | { title: string; icon: LucideIcon; items: NavLink[]; href?: never };

export const storeUrl = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "/";

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  {
    title: "Catalog",
    icon: Boxes,
    items: [
      { title: "Products", href: "/products" },
      { title: "Categories", href: "/categories" },
      { title: "Attributes", href: "/attributes" },
      { title: "Coupons", href: "/coupons" },
    ],
  },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
  { title: "Our Staff", href: "/our-staff", icon: UserCog },
  { title: "Settings", href: "/settings", icon: Settings },
  {
    title: "Online Store",
    icon: Store,
    items: [
      { title: "View Store", href: storeUrl, external: true },
      { title: "Store Customization", href: "/store/customization" },
      { title: "Store Settings", href: "/store/store-settings" },
    ],
  },
];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getNavTitle(pathname: string): {
  group?: string;
  title: string;
} {
  for (const item of navItems) {
    if (item.items) {
      const child = item.items.find(
        (link) => !link.external && isActivePath(pathname, link.href)
      );
      if (child) return { group: item.title, title: child.title };
    } else if (isActivePath(pathname, item.href)) {
      return { title: item.title };
    }
  }
  return { title: "Dashboard" };
}
