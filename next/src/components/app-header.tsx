import { CloudIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  const date = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "short" }).format(new Date());
  return <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl md:px-6"><SidebarTrigger /><Separator orientation="vertical" className="h-5" /><div className="min-w-0 flex-1"><p className="text-xs uppercase tracking-[.18em] text-muted-foreground">Personal training line</p><p className="truncate text-sm font-semibold">{date}</p></div><Badge variant="outline" className="hidden sm:flex"><CloudIcon /> Your record</Badge><ThemeToggle /></header>;
}
