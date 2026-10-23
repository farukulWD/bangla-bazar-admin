"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShoppingBag } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { isActivePath, navItems } from "@/config/nav";
import { getInitials } from "@/lib/initials";
import { useSession } from "@/store/api/auth/hooks/use-session";

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { user } = useSession();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" onClick={closeMobile} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShoppingBag className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading font-semibold text-foreground">
                  Bangla Bazar
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Admin panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              if (!item.items) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActivePath(pathname, item.href)}
                      render={<Link href={item.href} onClick={closeMobile} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              const groupActive = item.items.some(
                (link) => !link.external && isActivePath(pathname, link.href)
              );

              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={groupActive}
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={groupActive}
                      />
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 in-data-panel-open:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((link) => (
                        <SidebarMenuSubItem key={link.title}>
                          <SidebarMenuSubButton
                            isActive={
                              !link.external && isActivePath(pathname, link.href)
                            }
                            render={
                              link.external ? (
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                />
                              ) : (
                                <Link href={link.href} onClick={closeMobile} />
                              )
                            }
                          >
                            <span>{link.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={user?.name}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                {getInitials(user?.name)}
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium text-foreground">
                  {user?.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.role?.name ?? user?.email ?? user?.phone}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
