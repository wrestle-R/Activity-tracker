# Sidebar Architecture & Layout System - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Full Code Implementation](#full-code-implementation)
5. [How It Works in Next.js](#how-it-works-in-nextjs)
6. [Best Practices & Architecture Patterns](#best-practices--architecture-patterns)
7. [Styling & Theming](#styling--theming)
8. [Performance Considerations](#performance-considerations)
9. [Advice for Other Projects](#advice-for-other-projects)

---

## Overview

This document contains the complete implementation of a production-ready sidebar navigation system built with **Next.js 14+**, **React**, **TypeScript**, **Shadcn/ui**, **Framer Motion**, and **TailwindCSS**. The system supports:

- **Collapsible navigation groups** with smooth animations
- **Dynamic device/unit management** from database
- **Role-based sidebars** (Admin vs Customer)
- **Responsive design** with mobile collapse
- **Active route detection** with visual indicators
- **Nested sub-items** with automatic expansion
- **User context integration** for personalized content
- **Status indicators** for device connectivity
- **Breadcrumb navigation** for page hierarchy

---

## Project Structure

```
next-app/
├── components/
│   ├── admin/
│   │   └── admin-sidebar.tsx          # Admin role sidebar
│   ├── customer/
│   │   ├── customer-sidebar.tsx       # Customer role sidebar
│   │   └── ems/
│   │       ├── chart-container.tsx
│   │       ├── metric-gauge.tsx
│   │       ├── page-skeleton.tsx
│   │       ├── stats-summary.tsx
│   │       └── tab-navigation.tsx
│   └── shared/
│       ├── topbar.tsx                 # Shared top navigation
│       ├── breadcrumb.tsx             # Breadcrumb component
│       └── layout.tsx
├── app/
│   ├── layout.tsx                     # Root layout (providers)
│   ├── admin/
│   │   ├── layout.tsx                 # Admin layout wrapper
│   │   ├── dashboard/
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   └── devices/
│   ├── (customer)/
│   │   ├── layout.tsx                 # Customer layout wrapper
│   │   ├── dashboard/
│   │   ├── devices/
│   │   └── profile/
│   └── api/
├── contexts/
│   ├── auth-provider.tsx
│   ├── user-context.tsx
│   └── theme-provider.tsx
├── hooks/
│   ├── use-devices.ts
│   └── use-mobile.ts
└── lib/
    └── utils.ts
```

---

## Core Components

### Component Relationships Diagram

```
Root Layout (providers)
    ↓
    ├── Admin Layout Wrapper
    │   ├── AdminSidebar
    │   ├── Topbar (with AppBreadcrumb)
    │   └── Main Content
    │
    └── Customer Layout Wrapper
        ├── UserProvider Context
        ├── CustomerSidebar
        ├── Topbar (with AppBreadcrumb)
        └── Main Content
```

---

## Full Code Implementation

### 1. Root Layout (`app/layout.tsx`)

This is the entry point for your entire application. It sets up all global providers.

```typescript
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/contexts/theme-provider";
import { AuthProvider } from "@/contexts/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Typography Configuration
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: "--font-heading", 
  weight: ["500", "600", "700", "800"] 
});

// SEO Metadata
export const metadata: Metadata = {
  title: "Technode IoT - Smart Energy Management",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${montserrat.variable}`} 
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Points:**
- **Providers Hierarchy**: Theme → Auth → Tooltip (order matters for context access)
- **Font Variables**: Stored as CSS variables for use in Tailwind
- **suppressHydrationWarning**: Prevents hydration mismatch warnings when theme is applied
- **Toaster Position**: Top-right for toast notifications

---

### 2. Admin Layout (`app/admin/layout.tsx`)

```typescript
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AppBreadcrumb } from "@/components/shared/breadcrumb";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full min-h-screen bg-background">
        {/* Sticky Header with Breadcrumbs */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <div className="h-6 w-px bg-border" />
          <AppBreadcrumb />
        </header>
        
        {/* Main Content Area */}
        <div className="p-4 md:p-6 relative">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
```

**Key Layout Features:**
- **SidebarProvider**: Manages sidebar state (expanded/collapsed) globally
- **Sticky Header**: Stays fixed at top during scroll
- **z-10**: Ensures header stays above content
- **Backdrop Blur**: Modern glass-morphism effect
- **Responsive Padding**: 4px mobile, 6px desktop
- **AppBreadcrumb**: Dynamically generated from route

---

### 3. Customer Layout (`app/(customer)/layout.tsx`)

```typescript
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { AppBreadcrumb } from "@/components/shared/breadcrumb";
import { UserProvider } from "@/contexts/user-context";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SidebarProvider>
        <CustomerSidebar />
        <main className="w-full min-h-screen bg-background">
          {/* Sticky Header with Navigation */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="h-6 w-px bg-border" />
            <AppBreadcrumb />
          </header>
          
          {/* Main Content Area */}
          <div className="p-4 md:p-6 relative">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </UserProvider>
  );
}
```

**Differences from Admin Layout:**
- **UserProvider Wrapping**: Makes user context available to all child components
- **Same Structure**: Maintains consistency across roles
- **CustomerSidebar**: Different navigation for customer role

---

### 4. Admin Sidebar (`components/admin/admin-sidebar.tsx`)

```typescript
"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Users,
  LogOut,
  ChevronRight,
  Settings,
  BarChart3,
  Gauge,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

// Type Definitions
interface NavSubItem {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Static Navigation Configuration
const navGroups: NavGroup[] = [
  {
    label: "Management",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: Home,
      },
      {
        title: "Customers",
        href: "/admin/customers",
        icon: Users,
        subItems: [
          {
            title: "All Customers",
            href: "/admin/customers",
          },
          {
            title: "Create Customer",
            href: "/admin/customers/create",
          },
        ],
      },
    ],
  },
  {
    label: "Devices",
    items: [
      {
        title: "EMS Units",
        href: "/admin/devices/ems",
        icon: Gauge,
        subItems: [
          {
            title: "All Units",
            href: "/admin/devices/ems",
          },
        ],
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();

  // Check if current route matches a navigation item
  const isActive = (url: string, hasChildren = false) => {
    if (pathname === url) return true;
    if (hasChildren) return pathname.startsWith(url + "/");
    return false;
  };

  // Determine if group should be open by default
  const isGroupOpen = (item: NavItem) => {
    if (isActive(item.href, true)) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => pathname === sub.href);
    }
    return false;
  };

  // Handle parent menu click - navigate to first sub-item
  const handleParentClick = (item: NavItem) => {
    if (item.subItems && item.subItems.length > 0) {
      router.push(item.subItems[0].href);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="[&_[data-sidebar=sidebar]]:scrollbar-thin [&_[data-sidebar=sidebar]]:scrollbar-track-transparent [&_[data-sidebar=sidebar]]:scrollbar-thumb-border/40 hover:[&_[data-sidebar=sidebar]]:scrollbar-thumb-border/60 [&_[data-sidebar=sidebar]]:scrollbar-thumb-rounded-full"
    >
      <SidebarContent>
        {/* Logo Section */}
        <SidebarGroup>
          {state === "expanded" && (
            <Link 
              href="/admin/dashboard" 
              className="flex items-center justify-center mb-4"
            >
              <Image
                src="/logo.png"
                alt="Technode IoT"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          )}
        </SidebarGroup>

        {/* Navigation Groups */}
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) =>
                  item.subItems ? (
                    // Collapsible Item
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isGroupOpen(item)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive(item.href, true)}
                            tooltip={item.title}
                            onClick={() => handleParentClick(item)}
                            className={cn(
                              "cursor-pointer",
                              state === "expanded" &&
                                isActive(item.href, true) &&
                                "bg-primary/10 border-l-4 border-primary pl-2 font-medium"
                            )}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        
                        {/* Nested Sub Items */}
                        <CollapsibleContent>
                          <SidebarMenuSub className="border-l-primary/30">
                            {item.subItems.map((sub) => (
                              <SidebarMenuSubItem key={sub.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === sub.href}
                                  className={cn(
                                    "transition-colors",
                                    pathname === sub.href
                                      ? "bg-primary/10 text-primary font-medium before:absolute before:-left-[9px] before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[3px] before:rounded-full before:bg-primary"
                                      : "hover:bg-muted/50"
                                  )}
                                >
                                  <Link href={sub.href}>{sub.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    // Simple Item (No Sub Items)
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href, true)}
                        tooltip={item.title}
                        className={cn(
                          state === "expanded" &&
                            isActive(item.href, true) &&
                            "bg-primary/10 border-l-4 border-primary pl-2 font-medium"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer - Sign Out */}
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sign Out"
              className="w-full mb-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Link href="/" className="flex items-center w-full">
                <LogOut
                  className={cn(
                    "h-4 w-4",
                    state === "expanded" && "ml-2"
                  )}
                />
                {state === "expanded" && (
                  <span className="font-medium">Sign Out</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
```

**Architecture Highlights:**
- **Type Safety**: Interfaces for NavItem, NavSubItem, NavGroup
- **Static Config**: Navigation defined as constant for easy management
- **Active Detection**: `isActive()` function checks current route
- **Collapsible Groups**: Uses Shadcn Collapsible component
- **Auto-Expansion**: Groups expand when their routes are active
- **State Management**: Uses SidebarProvider context for expand/collapse state
- **Visual Indicators**: Active items get background color and left border
- **Responsive**: Hidden logo when collapsed, tooltip always present

---

### 5. Customer Sidebar (`components/customer/customer-sidebar.tsx`)

```typescript
"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  Home,
  User,
  LogOut,
  ChevronRight,
  BarChart3,
  Table,
  FileText,
  Cpu,
  CircuitBoard,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import { useDevices } from "@/hooks/use-devices";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { SidebarDeviceSkeleton } from "@/components/customer/ems/page-skeleton";

export function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useUser();
  const { state } = useSidebar();
  const { status } = useSession();
  const { units, isLoading: devicesLoading } = useDevices(
    status === "authenticated"
  );

  // Check if route is active
  const isActive = (url: string, hasChildren = false) => {
    if (pathname === url) return true;
    if (hasChildren) return pathname.startsWith(url + "/");
    return false;
  };

  // Handle logout
  const handleLogout = async () => {
    clearUser();
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="[&_[data-sidebar=sidebar]]:scrollbar-thin [&_[data-sidebar=sidebar]]:scrollbar-track-transparent [&_[data-sidebar=sidebar]]:scrollbar-thumb-border/40 hover:[&_[data-sidebar=sidebar]]:scrollbar-thumb-border/60 [&_[data-sidebar=sidebar]]:scrollbar-thumb-rounded-full"
    >
      <SidebarContent>
        {/* Logo Section */}
        <SidebarGroup>
          {state === "expanded" && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center mb-4"
            >
              <Image
                src="/logo.png"
                alt="Technode IoT"
                width={140}
                height={60}
                className="h-10 w-auto object-contain mr-12 mt-2"
                priority
              />
            </Link>
          )}
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                  className={cn(
                    state === "expanded" &&
                      isActive("/dashboard") &&
                      "bg-primary/10 border-l-4 border-primary pl-2 font-medium"
                  )}
                >
                  <Link href="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Devices Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Devices
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devicesLoading ? (
                // Loading Skeleton
                <SidebarDeviceSkeleton />
              ) : units.length === 0 ? (
                // No Devices Message
                <div className="px-3 py-4 text-xs text-muted-foreground/60 text-center">
                  Lorem ipsum dolor sit amet
                </div>
              ) : (
                // Device List
                units.map((unit) => (
                  <Collapsible
                    key={unit.unitId}
                    asChild
                    defaultOpen={pathname.includes(`/ems/${unit.unitId}`)}
                    className="group/unit"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={pathname.includes(`/ems/${unit.unitId}`)}
                          tooltip={unit.unitId}
                          className={cn(
                            "cursor-pointer",
                            state === "expanded" &&
                              pathname.includes(`/ems/${unit.unitId}`) &&
                              "bg-primary/10 border-l-4 border-primary pl-2 font-medium"
                          )}
                        >
                          <Cpu className="h-4 w-4" />
                          <span className="flex-1 truncate text-xs font-mono">
                            {unit.unitId.length > 14
                              ? `...${unit.unitId.slice(-10)}`
                              : unit.unitId}
                          </span>
                          <div className="flex items-center gap-1">
                            {state === "expanded" && (
                              <>
                                {unit.status?.toLowerCase() === "online" ? (
                                  <Wifi className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <WifiOff className="h-3 w-3 text-rose-400" />
                                )}
                              </>
                            )}
                            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/unit:rotate-90" />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      {/* Nested Device Sub-Items */}
                      <CollapsibleContent>
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SidebarMenuSub className="border-l-primary/20">
                              {unit.devices.map((device) => {
                                const devicePath = `/ems/${unit.unitId}/${encodeURIComponent(
                                  device.deviceName
                                )}`;
                                const isDeviceActive =
                                  pathname.includes(devicePath);

                                return (
                                  <Collapsible
                                    key={device.id}
                                    asChild
                                    defaultOpen={isDeviceActive}
                                    className="group/device"
                                  >
                                    <SidebarMenuSubItem>
                                      <CollapsibleTrigger asChild>
                                        <SidebarMenuSubButton
                                          isActive={isDeviceActive}
                                          className={cn(
                                            "cursor-pointer transition-colors",
                                            isDeviceActive
                                              ? "bg-primary/10 text-primary font-medium before:absolute before:-left-[9px] before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-[3px] before:rounded-full before:bg-primary"
                                              : "hover:bg-muted/50"
                                          )}
                                        >
                                          <CircuitBoard className="h-3.5 w-3.5 mr-1" />
                                          <span className="flex-1 truncate">
                                            {device.nickname ||
                                              device.deviceName}
                                          </span>
                                          <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/device:rotate-90" />
                                        </SidebarMenuSubButton>
                                      </CollapsibleTrigger>

                                      {/* Device Sub-Navigation */}
                                      <CollapsibleContent>
                                        <SidebarMenuSub className="border-l-muted-foreground/20 ml-2">
                                          {[
                                            {
                                              title: "Charts",
                                              href: `${devicePath}/charts`,
                                              icon: BarChart3,
                                            },
                                            {
                                              title: "Logs",
                                              href: `${devicePath}/logs`,
                                              icon: Table,
                                            },
                                            {
                                              title: "Reports",
                                              href: `${devicePath}/reports`,
                                              icon: FileText,
                                            },
                                          ].map((sub) => (
                                            <SidebarMenuSubItem
                                              key={sub.title}
                                            >
                                              <SidebarMenuSubButton
                                                asChild
                                                isActive={pathname.startsWith(
                                                  sub.href
                                                )}
                                                className={cn(
                                                  "transition-colors text-xs",
                                                  pathname.startsWith(
                                                    sub.href
                                                  )
                                                    ? "bg-primary/8 text-primary font-medium"
                                                    : "hover:bg-muted/50"
                                                )}
                                              >
                                                <Link href={sub.href}>
                                                  <sub.icon className="h-3 w-3 mr-1.5" />
                                                  {sub.title}
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          ))}
                                        </SidebarMenuSub>
                                      </CollapsibleContent>
                                    </SidebarMenuSubItem>
                                  </Collapsible>
                                );
                              })}
                            </SidebarMenuSub>
                          </motion.div>
                        </AnimatePresence>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile & Logout */}
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          {/* User Profile */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/profile")}
              tooltip="Profile"
              className={cn(
                "w-full h-auto py-2.5",
                isActive("/profile")
                  ? "bg-primary/10 border-l-4 border-primary"
                  : "hover:bg-muted/50"
              )}
            >
              <Link
                href="/profile"
                className="flex items-center gap-3 w-full"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
                    state === "collapsed" && "h-6 w-6"
                  )}
                >
                  <User className="h-4 w-4" />
                </div>
                {state === "expanded" && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user?.customerRepresentative || "My Profile"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email || "View profile"}
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={handleLogout}
              className="w-full mb-2 cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <LogOut
                className={cn(
                  "h-4 w-4",
                  state === "expanded" && "ml-2"
                )}
              />
              {state === "expanded" && (
                <span className="font-medium">Logout</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
```

**Key Features:**
- **Dynamic Devices**: Loads from `useDevices()` hook connected to database
- **Nested Collapsibles**: 3-level hierarchy (Unit → Device → Actions)
- **Framer Motion**: Smooth animations on device expansion
- **Status Indicators**: WiFi icons showing device online/offline status
- **User Context**: Displays current user info in footer
- **Logout Handler**: Clears user context and signs out
- **Auto-Expansion**: Opens collapsed sections when route matches
- **Skeleton Loading**: Shows placeholder while loading devices

---

### 6. Breadcrumb Component (`components/shared/breadcrumb.tsx`)

```typescript
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const pathnames = pathname.split("/").filter((x) => x);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home Link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Dynamic Breadcrumbs */}
        {pathnames.map((value, index) => {
          // Skip "dashboard" as Home link already covers it
          if (value === "dashboard") return null;

          // Build the path up to current segment
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          // Format label: convert kebab-case to Title Case
          let displayName = value
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  // Current page (not clickable)
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  // Previous pages (clickable)
                  <BreadcrumbLink asChild>
                    <Link href={to}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

**How It Works:**
- **Auto-Generated**: Derived from current pathname
- **Format Conversion**: Converts `/admin-customers` → "Admin Customers"
- **Last Item**: Current page shown as text (not clickable)
- **Previous Items**: Shown as clickable links
- **Responsive**: No text wrapping with proper truncation

**Examples:**
- Route: `/admin/customers` → Home > Customers
- Route: `/ems/unit-01/sensor-data/charts` → Home > Ems > Unit 01 > Sensor Data > Charts

---

### 7. Topbar Component (`components/shared/topbar.tsx`)

```typescript
"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TopbarProps {
  basePath?: string;
}

export function Topbar({ basePath = "" }: TopbarProps) {
  const pathname = usePathname();

  // Extract segments from pathname
  const segments = pathname
    .replace(basePath, "")
    .split("/")
    .filter(Boolean);

  // Build breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const href = basePath + "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 transition-[width,height] ease-linear">
      {/* Sidebar Toggle Button */}
      <SidebarTrigger className="-ml-1 p-2" />
      
      {/* Vertical Separator */}
      <Separator orientation="vertical" className="mr-2 !h-4" />
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <Fragment key={item.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
```

---

## How It Works in Next.js

### 1. **Route Organization & Layout System**

Next.js 14+ uses App Router with file-based routing and layout hierarchies:

```
app/
├── layout.tsx                    ← Root Layout (all pages)
├── admin/
│   ├── layout.tsx               ← Admin Layout wrapper
│   ├── dashboard/page.tsx
│   ├── customers/page.tsx
│   └── customers/create/page.tsx
└── (customer)/                   ← Route Group (doesn't create URL segment)
    ├── layout.tsx               ← Customer Layout wrapper
    ├── dashboard/page.tsx
    └── profile/page.tsx
```

**Route Groups** `(name)` allow organizing without affecting the URL structure. Both `/admin/*` and `/customer/*` have different layouts but share the same parent.

### 2. **Provider Hierarchy**

The nesting of providers is **critical for context access**:

```
RootLayout
  ├── ThemeProvider (theme context)
  │   └── AuthProvider (auth context)
  │       └── TooltipProvider (tooltip context)
  │           └── Children
  │
  └── Toaster (notifications)
```

Each child has access to all parent contexts. If you need auth in theme logic, this nesting allows it.

### 3. **Sidebar State Management**

The `SidebarProvider` component (from Shadcn) manages global sidebar state:

```typescript
const { state } = useSidebar();
// state is either "expanded" or "collapsed"
```

When user clicks `SidebarTrigger`, the provider updates state globally. All sidebar components react to this state change.

### 4. **Route Detection & Active States**

```typescript
const pathname = usePathname();  // Gets current URL: "/admin/customers"

const isActive = (url: string, hasChildren = false) => {
  if (pathname === url) return true;           // Exact match
  if (hasChildren) return pathname.startsWith(url + "/");  // Prefix match
  return false;
};

// Usage: isActive("/admin/customers", true) → true for "/admin/customers/123"
```

### 5. **Dynamic Navigation from Database**

The `useDevices()` hook fetches units from the database:

```typescript
const { units, isLoading: devicesLoading } = useDevices(
  status === "authenticated"
);

// units: Array<{
//   unitId: string
//   status: "online" | "offline"
//   devices: Array<{
//     id: string
//     deviceName: string
//     nickname: string
//   }>
// }>

// Map units into collapsible sidebar items
units.map((unit) => (
  <Collapsible key={unit.unitId}>
    {/* Device list inside */}
  </Collapsible>
))
```

### 6. **Client Components (`"use client"`)**

All interactive components must be client components:
- Navigation changes require `useRouter()` and `usePathname()`
- State management needs `useState()`, `useContext()`
- Event handlers need `onClick`, `onChange`

Server components are used for data fetching at page/layout level.

### 7. **Image Optimization**

```typescript
<Image
  src="/logo.png"
  alt="Technode IoT"
  width={140}
  height={40}
  className="h-10 w-auto object-contain"
  priority              // Load immediately, don't lazy-load
/>
```

Next.js `<Image>` component:
- Automatically optimizes format (WebP, AVIF)
- Lazy-loads by default (except `priority`)
- Provides width/height for CLS prevention

### 8. **Link Navigation**

```typescript
import Link from "next/link";

<Link href="/admin/dashboard">Dashboard</Link>
```

Next.js `<Link>` provides:
- Prefetching on hover (performance boost)
- Client-side navigation (no page reload)
- Accessibility features built-in

---

## Best Practices & Architecture Patterns

### ✅ 1. **Separate Navigation by Role**

**Why:** Different users need different navigation hierarchies.

```typescript
// Admin sees all management features
const adminNav = [
  { title: "Customers", href: "/admin/customers" },
  { title: "Devices", href: "/admin/devices" },
];

// Customer sees only their devices
const customerNav = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "My Devices", href: "/devices" },
];
```

**Implementation:**
- Use separate sidebar components: `AdminSidebar` vs `CustomerSidebar`
- Apply different layouts: `app/admin/layout.tsx` vs `app/(customer)/layout.tsx`
- Check auth role at layout level to redirect appropriately

### ✅ 2. **Type-Safe Navigation Configuration**

**Why:** Catch navigation errors at compile time, prevent broken links.

```typescript
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

const navConfig: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",  // TypeScript checks this path
    icon: HomeIcon,
  },
];
```

**Better with const-as-const:**
```typescript
const NAV_ITEMS = [
  { title: "Dashboard", href: "/admin/dashboard" },
] as const;

type NavHref = typeof NAV_ITEMS[number]["href"];
// NavHref = "/admin/dashboard"
```

### ✅ 3. **Smart Active Route Detection**

**Why:** Different nav items need different matching logic.

```typescript
const isActive = (url: string, hasChildren = false) => {
  if (pathname === url) return true;                      // Exact match
  if (hasChildren) return pathname.startsWith(url + "/"); // Nested routes
  return false;
};

// Admin Customers nav item is "active" for:
// - /admin/customers          (exact match)
// - /admin/customers/123      (nested route)
// - /admin/customers/123/edit (deeply nested)
```

### ✅ 4. **Collapsible State Sync**

**Why:** Expanding a nav group should persist when navigating within it.

```typescript
const isGroupOpen = (item: NavItem) => {
  // Open if current route is within this group
  if (isActive(item.href, true)) return true;
  
  // Open if any sub-item matches current route
  if (item.subItems) {
    return item.subItems.some((sub) => pathname === sub.href);
  }
  return false;
};

<Collapsible defaultOpen={isGroupOpen(item)}>
```

**Result:**
- User navigates to `/admin/customers/create`
- "Customers" menu automatically expands on next page load
- Feels like natural continuation

### ✅ 5. **Smooth Animations with Framer Motion**

**Why:** Professional UX with performance considerations.

```typescript
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.2 }}
  >
    {/* Device list content */}
  </motion.div>
</AnimatePresence>
```

**Benefits:**
- `AnimatePresence`: Handles animations when components mount/unmount
- `height: "auto"`: Smooth height transitions
- `duration: 0.2`: Fast enough to feel responsive (~200ms)
- GPU-accelerated: Transform and opacity changes

### ✅ 6. **Responsive Collapse Behavior**

**Why:** Mobile users need easy sidebar access, desktop users want compact view.

```typescript
const { state } = useSidebar();
// state = "expanded" | "collapsed"

{state === "expanded" && (
  <>
    <span>{item.title}</span>
    <LogoImage />
  </>
)}

// When collapsed:
// - Logo hidden
// - Text labels hidden
// - Icons only visible
// - Tooltips appear on hover
```

### ✅ 7. **Skeleton Loading for Dynamic Content**

**Why:** Prevent layout shift, maintain responsive feel during data fetch.

```typescript
{devicesLoading ? (
  <SidebarDeviceSkeleton />  // Placeholder same height/width
) : units.length === 0 ? (
  <div>No devices</div>
) : (
  <div>{renderDevices()}</div>
)}
```

**Prevents Cumulative Layout Shift (CLS) jank.**

### ✅ 8. **Context Layering for Features**

**Why:** Different features need different contexts without prop drilling.

```typescript
// Root layout
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

// Customer layout adds user context
export default function CustomerLayout() {
  return (
    <UserProvider>
      <SidebarProvider>
        <CustomerSidebar />
        {children}
      </SidebarProvider>
    </UserProvider>
  );
}
```

**Result:**
- Theme available everywhere
- Auth available everywhere
- User context only in customer routes
- No prop drilling through 5 component levels

### ✅ 9. **Breadcrumb as Navigation Aid**

**Why:** Users don't get "lost" in deeply nested hierarchies.

```typescript
// Route: /admin/customers/123/edit
// Breadcrumb: Home > Admin > Customers > 123 > Edit

// User can click "Customers" to see full list without using back button
// Better mental model of site structure
```

### ✅ 10. **Status Indicators for Real-Time Data**

**Why:** Quick visual feedback for device state without clicking.

```typescript
{unit.status?.toLowerCase() === "online" ? (
  <Wifi className="h-3 w-3 text-emerald-400" />
) : (
  <WifiOff className="h-3 w-3 text-rose-400" />
)}
```

**Can be enhanced with WebSocket updates:**
```typescript
// In useDevices hook
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/devices");
  ws.onmessage = (msg) => {
    setUnits(prev => updateDeviceStatus(prev, JSON.parse(msg.data)));
  };
}, []);
```

---

## Styling & Theming

### Design System

The sidebar uses **Tailwind CSS** utility classes organized by concern:

#### Layout Classes
```typescript
className="flex h-14 items-center gap-2 border-b px-4"
```
- `flex`: Flexbox container
- `h-14`: Height (56px, Tailwind's standard height unit)
- `items-center`: Vertical center alignment
- `gap-2`: 8px spacing between items
- `border-b`: Bottom border
- `px-4`: 16px horizontal padding

#### State-Based Styling
```typescript
className={cn(
  "cursor-pointer transition-colors",
  isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
)}
```

**When Active:**
- `bg-primary/10`: 10% opacity primary background
- `text-primary`: Primary text color
- `font-medium`: Font weight 500

**When Inactive:**
- `hover:bg-muted/50`: 50% opacity muted background on hover

#### Semantic Color Usage
```typescript
"text-rose-600"         // Destructive action (logout)
"text-emerald-400"      // Success state (online)
"text-rose-400"         // Error state (offline)
"text-primary"          // Primary action
"text-muted-foreground" // Secondary text
"bg-background"         // Page background
```

### Dark Mode Support

All colors use CSS variables that change in dark mode:

```css
/* light.css */
:root {
  --primary: 226 89% 52%;  /* Blue */
  --background: 0 0% 100%; /* White */
  --foreground: 222 84% 5%; /* Near-black */
}

/* dark.css */
[data-theme="dark"] {
  --primary: 217 91% 60%;  /* Brighter blue */
  --background: 222 84% 5%; /* Near-black */
  --foreground: 210 40% 96%; /* Off-white */
}
```

Tailwind automatically applies these in TailwindCSS classes like `text-primary`, `bg-background`.

---

## Performance Considerations

### 1. **Code Splitting**

```typescript
// Components loaded only when needed
const AdminSidebar = dynamic(() => import("./admin-sidebar"));
const CustomerSidebar = dynamic(() => import("./customer-sidebar"));

// Different routes load different sidebars
```

### 2. **Memoization**

```typescript
import { memo } from "react";

// Prevent re-renders when props haven't changed
export const SidebarItem = memo(({ title, href, isActive }) => (
  <Link href={href}>{title}</Link>
));
```

### 3. **Lazy Loading Devices**

```typescript
const { units, isLoading } = useDevices(
  status === "authenticated"  // Only fetch when authenticated
);

// Component shows skeleton while loading, prevents blocking render
```

### 4. **Image Optimization**

```typescript
<Image
  src="/logo.png"
  width={140}
  height={40}
  priority        // Load immediately, critical LCP image
/>
```

### 5. **Efficient CSS-in-JS**

```typescript
// Shadcn components use CSS modules, not styled-components
// Smaller bundle, faster FCP
className="[&_[data-sidebar=sidebar]]:scrollbar-thumb-border/40"
// Uses CSS attribute selectors, no JS parsing needed
```

### 6. **Event Delegation**

```typescript
// Instead of many click handlers, use event delegation
<SidebarMenu onClick={(e) => handleItemClick(e)}>
  {items.map(item => <div key={item.id}>{item.label}</div>)}
</SidebarMenu>
```

---

## Advice for Other Projects

### 📋 1. **Planning Phase**

Before building any new dashboard:

- **Role Analysis**: What roles will use the app? (Admin, User, Guest)
- **Navigation Depth**: How many menu levels? (2-3 is ideal, 4+ gets confusing)
- **Dynamic Content**: Will menu items come from database or be static?
- **Mobile UX**: How should sidebar behave on mobile? (Drawer vs Stack)

**Checklist:**
- [ ] Document all user roles
- [ ] Create wireframe of navigation hierarchy
- [ ] Decide on collapse/expand behavior
- [ ] Plan breadcrumb strategy

### 🏗️ 2. **Architecture Decisions**

**Sidebar Approach:**
```typescript
// Option 1: Collapsible Menu (our approach)
✅ Good for many items (20+)
✅ Compact view available
❌ Learning curve (where is it?)

// Option 2: Always Expanded
✅ All items visible
❌ Takes up space
❌ Not good on mobile

// Option 3: Drawer/Modal
✅ Full screen on mobile
❌ Items not visible on desktop
❌ Disrupts workflow
```

**Choose based on content volume and device distribution.**

**Breadcrumb Strategy:**
```typescript
// Option 1: Auto-generated (our approach)
✅ No maintenance needed
✅ Always accurate
❌ Labels might be ugly ("prd-mgmt-v2")

// Option 2: Custom mapping
✅ Beautiful labels
❌ Maintenance burden
❌ Easy to break with refactors

// Option 3: No breadcrumbs
✅ Simpler code
❌ Users get lost easily
```

**Use auto-generated with careful URL naming.**

### 🎨 3. **Design System Integration**

Build sidebars that match your design system:

```typescript
// Bad: Hardcoded colors
className="bg-blue-500 text-white"

// Good: Design system tokens
className="bg-primary text-primary-foreground"

// Better: Component prop
<SidebarMenuButton variant="active" />
```

**Benefits:**
- Consistent across app
- Easy to rebrand
- Dark mode automatic

### ⚡ 4. **Performance Optimization**

For projects with 100+ menu items:

```typescript
// Virtualize long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={40}
>
  {({ index, style }) => (
    <SidebarItem style={style} item={items[index]} />
  )}
</FixedSizeList>

// Only renders visible items, massive performance gain
```

### 🔄 5. **Real-Time Updates**

For dashboards with live data:

```typescript
// Server-Sent Events (SSE) for uni-directional updates
const useDeviceUpdates = () => {
  useEffect(() => {
    const eventSource = new EventSource('/api/devices/stream');
    eventSource.onmessage = (e) => {
      setDevices(JSON.parse(e.data));
    };
    return () => eventSource.close();
  }, []);
};

// WebSocket for bi-directional communication
const useDeviceSocket = () => {
  useEffect(() => {
    const ws = new WebSocket('wss://api/devices');
    ws.onmessage = (e) => updateDeviceState(JSON.parse(e.data));
    return () => ws.close();
  }, []);
};
```

### 📱 6. **Mobile-First Development**

```typescript
// Use Tailwind breakpoints
className="block md:hidden"     // Show on mobile, hide on desktop
className="hidden md:block"     // Hide on mobile, show on desktop

// Responsive sidebar
const { isMobile } = useIsMobile();

return isMobile ? (
  <SidebarDrawer />             // Full-screen drawer on mobile
) : (
  <SidebarCollapsible />        // Collapsible on desktop
);
```

### 🧪 7. **Testing Strategy**

```typescript
import { render, screen } from '@testing-library/react';
import { AdminSidebar } from './admin-sidebar';

describe('AdminSidebar', () => {
  it('shows active badge for current route', () => {
    render(<AdminSidebar pathname="/admin/dashboard" />);
    expect(screen.getByText('Dashboard')).toHaveClass('bg-primary/10');
  });

  it('expands collapsible groups on mount', () => {
    render(<AdminSidebar pathname="/admin/customers/create" />);
    expect(screen.getByText('Create Customer')).toBeVisible();
  });
});
```

### 📊 8. **Analytics & Usage**

Track user interactions:

```typescript
const handleSidebarToggle = (newState: "expanded" | "collapsed") => {
  // Send to analytics
  gtag('event', 'sidebar_toggle', {
    new_state: newState,
    timestamp: new Date().toISOString(),
  });

  // Update UI
  updateSidebarState(newState);
};
```

**Insights you'll get:**
- Do users keep sidebar collapsed? (Maybe it's taking too much space)
- Which menu items are never clicked? (Maybe remove them)
- Mobile vs desktop usage patterns? (Optimize accordingly)

### 🔐 9. **Security in Navigation**

```typescript
// ❌ Don't trust frontend for auth
if (isLoggedIn) {
  return <AdminSidebar />;
}

// ✅ Validate on backend too
export async function AdminLayout({ children }) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      {children}
    </SidebarProvider>
  );
}
```

### 🎯 10. **SEO Considerations**

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | Technode IoT',
    default: 'Technode IoT - Energy Management',
  },
  description: 'Lorem ipsum dolor sit amet...',
  robots: {
    index: false,  // Don't index admin/protected pages
    follow: false,
  },
};
```

---

## Common Patterns & Solutions

### Pattern 1: Accordion Navigation (One Group Open)

```typescript
const [openGroup, setOpenGroup] = useState<string | null>(null);

{navGroups.map(group => (
  <Collapsible
    key={group.label}
    open={openGroup === group.label}
    onOpenChange={(open) => {
      setOpenGroup(open ? group.label : null);
    }}
  >
    {/* content */}
  </Collapsible>
))}

// Only one group expanded at a time
```

### Pattern 2: Sticky Group Labels

```typescript
// Labels stick to top while scrolling
className="sticky top-0 bg-background z-20"
```

### Pattern 3: Search Filter

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredItems = navItems.filter(item =>
  item.title.toLowerCase().includes(searchQuery.toLowerCase())
);

<input
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

{filteredItems.length === 0 && <p>No items found</p>}
```

### Pattern 4: Keyboard Navigation

```typescript
import { useEffect } from 'react';

export function SidebarWithKeyboard() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        showHelpModal();
      }
      if (e.key === 'Escape') {
        closeSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return <Sidebar />;
}
```

### Pattern 5: Analytics in Breadcrumbs

```typescript
<BreadcrumbLink
  href={item.href}
  onClick={() => {
    gtag('event', 'navigation', {
      label: item.label,
      destination: item.href,
    });
  }}
>
  {item.label}
</BreadcrumbLink>
```

---

## Summary Table: Component Usage

| Component | Purpose | Key Props | State | Exported From |
|-----------|---------|-----------|-------|---|
| `AdminSidebar` | Admin navigation menu | - | `pathname`, `user`, `sidebar state` | `components/admin/` |
| `CustomerSidebar` | Customer navigation menu | - | `pathname`, `devices`, `user` | `components/customer/` |
| `Topbar` | Header with breadcrumbs | `basePath` | `pathname` | `components/shared/` |
| `AppBreadcrumb` | Dynamic breadcrumb nav | - | `pathname` | `components/shared/` |
| Layout wrappers | Structure + providers | `children` | route context | `app/*/layout.tsx` |

---

## Final Recommendations

### ✅ DO:
- Use semantic HTML (`<nav>`, `<header>`, `<main>`)
- Implement skip links for accessibility
- Test on real mobile devices (not just DevTools)
- Version your navigation structure (`v1/`, `v2/`)
- Load analytics bundle after main content
- Use IndexedDB for sidebar state persistence
- Document your nav structure in Storybook

### ❌ DON'T:
- Hardcode navigation (make it configurable)
- Nest more than 4 levels deep
- Use color alone for state indication (use icons too)
- Leave loading states ambiguous
- Ignore keyboard navigation
- Reload full page on navigation
- Hide critical navigation behind hamburger on desktop

---

**Created**: February 2026
**Framework**: Next.js 14+ with TypeScript
**UI Library**: Shadcn/ui
**Styling**: TailwindCSS
**State**: React Context + Hooks
**Animations**: Framer Motion

This guide provides a production-ready implementation pattern for any dashboard application. Adapt the specifics to your use case while maintaining these core principles for best results.