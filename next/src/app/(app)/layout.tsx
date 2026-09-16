import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider><AppSidebar /><SidebarInset><AppHeader /><div className="mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8">{children}</div></SidebarInset></SidebarProvider>;
}

