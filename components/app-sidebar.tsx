import * as React from "react";
import {
  CalendarArrowUp,
  ChevronRight,
  Home,
  PackageSearch,
  Settings,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn, isRouteMatch } from "@/lib/utils";
import { useRouter } from "next/router";
import { NavUser } from "./nav-user";

interface INavMain {
  Icon?: React.ReactNode;
  title: string;
  url: string;
  items?: {
    title: string;
    Icon?: React.ReactNode;
    url: string;
  }[];
}

const data: {
  navMain: INavMain[];
} = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      Icon: <Home className="!size-5" strokeWidth={2.5} />,
    },
    {
      title: "Products",
      url: "/products",
      Icon: <PackageSearch className="!size-5" strokeWidth={2.5} />,
    },
    {
      title: "Orders",
      url: "#",
      Icon: <CalendarArrowUp className="!size-5" strokeWidth={2.5} />,
      items: [
        {
          title: "All Orders",
          url: "/orders",
          Icon: <ShoppingBag className="!size-5" strokeWidth={2.5} />,
        },
        {
          title: "Shipments",
          url: "/shipments",
          Icon: <Truck className="!size-5" strokeWidth={2.5} />,
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      Icon: <Settings className="!size-5" strokeWidth={2.5} />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const currentPath = router.pathname;
  const [openCollapsibles, setOpenCollapsibles] = React.useState<string[]>([]);

  React.useEffect(() => {
    const activeParents: string[] = [];
    data.navMain.forEach(({ items = [], title }) => {
      if (items.length > 0) {
        const hasActiveChild = items.some((item) =>
          isRouteMatch(currentPath, item.url)
        );
        if (hasActiveChild) {
          activeParents.push(title);
        }
      }
    });
    setOpenCollapsibles(activeParents);
  }, [currentPath]);

  const handleNavClick = (title: string, hasItems: boolean) => {
    if (!hasItems) {
      setOpenCollapsibles([]);
    } else {
      setOpenCollapsibles((prev) =>
        prev.includes(title)
          ? prev.filter((t) => t !== title)
          : [...prev, title]
      );
    }
  };

  return (
    <Sidebar {...props}>
      <Link href="/">
        <SidebarHeader className="bg-primary border-b border-gray-500/40 h-[5rem] flex items-center justify-center">
          <Link href="/" className="flex justify-center">
            <img src="/logo.png" className="w-[8rem] h-auto" />
          </Link>
        </SidebarHeader>
      </Link>
      <SidebarContent className="gap-0 text-white bg-primary pt-[3rem] px-3">
        {data.navMain.map(({ items = [], title, url, Icon }) => {
          const isActive = isRouteMatch(currentPath, url);
          const hasItems = items.length > 0;
          const isOpen = openCollapsibles.includes(title);

          return (
            <Link href={url ?? "#"} key={title}>
              <Collapsible
                title={title}
                open={isOpen}
                onOpenChange={() => handleNavClick(title, hasItems)}
                className="group/collapsible"
              >
                <SidebarGroup>
                  <SidebarGroupLabel
                    asChild
                    className={cn(
                      "group/label cursor-pointer text-white !text-[1rem] font-semibold",
                      isActive && "bg-sidebar-accent !text-primary",
                      items.length === 0 &&
                        "hover:bg-sidebar-accent hover:text-primary"
                    )}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 px-4 h-11">
                      {Icon}
                      {title}{" "}
                      {items.length > 0 && (
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  {items.length > 0 && (
                    <CollapsibleContent className="mx-3">
                      <SidebarGroupContent>
                        <SidebarMenu className="pt-4 flex flex-col gap-3">
                          {items.map((item) => {
                            const isActive = isRouteMatch(
                              currentPath,
                              item.url
                            );
                            return (
                              <SidebarMenuItem key={item.title}>
                                <Link href={item.url ?? "#"} key={title}>
                                  <SidebarMenuButton
                                    className={cn(
                                      "h-11 flex items-center gap-2 px-4 !text-[.95rem] font-semibold cursor-pointer",
                                      isActive &&
                                        "bg-sidebar-accent !text-primary"
                                    )}
                                  >
                                    {item.Icon}
                                    {item.title}
                                  </SidebarMenuButton>
                                </Link>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  )}
                </SidebarGroup>
              </Collapsible>
            </Link>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="bg-primary text-white cursor-pointer">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
