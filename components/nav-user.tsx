"use client";

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/store/hooks";
import useLogout from "@/hooks/use-logout";
import { Icons } from "./shared/icons";

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = useAppSelector((state) => state.user.user);
  const { logout, loading } = useLogout();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-primary hover:text-primary outline-none border-none px-4 h-14"
            >
              <div className="grid flex-1 text-left !text-base leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-sm text-medium">
                  {user?.email}
                </span>
              </div>
              {loading ? (
                <Icons.spinner className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronsUpDown className="ml-auto size-4" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-0"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup className="p-0">
              <DropdownMenuItem className="font-medium h-11 cursor-pointer rounded-none">
                <BadgeCheck />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="p-0 m-0" />
            <DropdownMenuItem
              className="font-medium h-11 cursor-pointer rounded-none"
              onClick={() => logout()}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
