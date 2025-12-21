import { PropsWithChildren } from "react";
import { useRouter } from "next/router";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const routes: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/payments": "Payments",
  "/all-orders": "Orders",
  "/rmb-purchase": "RMB Purchase",
  "/users": "Users",
  "/products": "Products",
  "/orders": "Order Items",
  "/settings": "Settings",
  "/shipments": "Shipments",
};

const getBasePath = (path: string): string => {
  const match = path.match(/^\/[^\/]+/);
  return match ? match[0] : "";
};

const AppLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const basePath = getBasePath(router.pathname);
  const title = routes[basePath] ?? "";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-white z-[50] sticky top-0 flex h-[5rem] shrink-0 items-center gap-4 border-b px-5 sm:px-10">
          <SidebarTrigger className="-ml-1" />
          <p className="text-[1.05rem] font-semibold">{title}</p>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 px-5 sm:px-10">
          <div className="max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
