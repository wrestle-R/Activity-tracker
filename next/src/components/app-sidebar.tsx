"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3Icon, DumbbellIcon, FootprintsIcon, LayoutDashboardIcon, SettingsIcon, UserIcon } from "lucide-react";
import { Mark } from "@/components/brand";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/sign-out-button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar";

const groups = [
  { label: "Overview", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon }, { href: "/progress", label: "Progress", icon: BarChart3Icon }] },
  { label: "Training", items: [{ href: "/workouts", label: "Gym sessions", icon: DumbbellIcon }, { href: "/runs", label: "Runs", icon: FootprintsIcon }] },
];

export function AppSidebar({ username, email }: { username?: string | null; email?: string | null }) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-3"><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" render={<Link href="/dashboard" />} tooltip="Sweatline"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-pulse text-pulse-foreground"><Mark className="size-6" /></span><span className="display text-xl font-bold uppercase">Sweatline</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>{groups.map((group) => <SidebarGroup key={group.label}><SidebarGroupLabel>{group.label}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{group.items.map((item) => <SidebarMenuItem key={item.href}><SidebarMenuButton render={<Link href={item.href} />} isActive={pathname === item.href} tooltip={item.label}><item.icon /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>)}</SidebarContent>
      <SidebarFooter><SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link href="/settings" />} isActive={pathname === "/settings"}><SettingsIcon /><span>Settings</span></SidebarMenuButton></SidebarMenuItem><SidebarMenuItem><div className="flex min-h-12 items-center gap-2 rounded-md px-2"><Avatar className="size-7"><AvatarFallback><UserIcon /></AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="block truncate font-medium">{username || "Athlete"}</span><span className="block truncate text-xs text-muted-foreground">{email}</span></span></div></SidebarMenuItem></SidebarMenu><SignOutButton /></SidebarFooter>
    </Sidebar>
  );
}
