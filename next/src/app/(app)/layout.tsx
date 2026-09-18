import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { client, user } = await requireUser();
  const { data: profile } = await client.from("sweatline_profiles").select("username,display_name").single();
  return <SidebarProvider><AppSidebar username={profile?.username ?? profile?.display_name} email={user.email} /><SidebarInset><AppHeader /><div className="mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8">{children}</div></SidebarInset></SidebarProvider>;
}
