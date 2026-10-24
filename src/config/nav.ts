import {
  Boxes,
  LayoutGrid,
  type LucideIcon,
  Mail,
  Settings,
  ShoppingCart,
  Store,
  UserCog,
  Users,
} from "lucide-react";

export type NavPermission = {
  module: string;
  permission: string;
};

export type NavLink = {
  title: string;
  href: string;
  external?: boolean;
  permission?: NavPermission;
};

export type NavItem =
  | (NavLink & { icon: LucideIcon; items?: never })
  | { title: string; icon: LucideIcon; items: NavLink[]; href?: never };

const VIEW_SETTINGS = { module: "settings", permission: "can_view_settings" };
const VIEW_USERS = { module: "user", permission: "can_view_users" };

export const storeUrl = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "/";

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  {
    title: "Catalog",
    icon: Boxes,
    items: [
      {
        title: "Products",
        href: "/products",
        permission: { module: "product", permission: "can_view_products" },
      },
      {
        title: "Categories",
        href: "/categories",
        permission: { module: "category", permission: "can_view_categories" },
      },
      {
        title: "Attributes",
        href: "/attributes",
        permission: { module: "attribute", permission: "can_view_attributes" },
      },
      {
        title: "Coupons",
        href: "/coupons",
        permission: { module: "coupon", permission: "can_view_coupons" },
      },
    ],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    permission: VIEW_USERS,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    permission: { module: "order", permission: "can_view_orders" },
  },
  {
    title: "Messages",
    href: "/contacts",
    icon: Mail,
    permission: { module: "contact", permission: "can_view_contacts" },
  },
  {
    title: "Users & Roles",
    icon: UserCog,
    items: [
      { title: "Users", href: "/users", permission: VIEW_USERS },
      {
        title: "Roles",
        href: "/roles",
        permission: { module: "role", permission: "can_view_roles" },
      },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    permission: VIEW_SETTINGS,
  },
  {
    title: "Online Store",
    icon: Store,
    items: [
      { title: "View Store", href: storeUrl, external: true },
      {
        title: "Store Customization",
        href: "/store/customization",
        permission: VIEW_SETTINGS,
      },
      {
        title: "Store Settings",
        href: "/store/store-settings",
        permission: VIEW_SETTINGS,
      },
    ],
  },
];

export function filterNavItems(
  items: NavItem[],
  allowed: (permission: NavPermission) => boolean
): NavItem[] {
  const visible = (link: NavLink) =>
    !link.permission || allowed(link.permission);

  return items.flatMap<NavItem>((item) => {
    if (!item.items) return visible(item) ? [item] : [];

    const links = item.items.filter(visible);
    return links.length > 0 ? [{ ...item, items: links }] : [];
  });
}

const STAFF_PATHS = ["/settings/change-password"];

export function getRequiredPermission(
  pathname: string
): NavPermission | null {
  if (STAFF_PATHS.some((path) => isActivePath(pathname, path))) return null;

  const links = navItems.flatMap((item) => (item.items ? item.items : [item]));
  const match = links
    .filter((link) => !link.external && isActivePath(pathname, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return match?.permission ?? null;
}

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
