import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";

const routes: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/payments": "Payments",
  "/orders": "Orders",
};

const AppLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-white z-[50] sticky top-0 flex h-[5rem] shrink-0 items-center gap-4 border-b px-5 sm:px-10">
          <SidebarTrigger className="-ml-1" />
          <p className="text-[1.05rem] font-semibold">{routes[currentPath]}</p>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 px-5 sm:px-10">
          <div className="max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
