import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const body = Barlow({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });
const display = Barlow_Condensed({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Sweatline", template: "%s · Sweatline" },
  description: "A focused, offline-first log for lifting, running, and the line between them.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#11130f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
