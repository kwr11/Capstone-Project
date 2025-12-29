import { getCurrentUser } from "@/actions/auth";
import "@/app/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { OfflineDialog } from "@/components/modals/offline";
import { SettingsProvider } from "@/components/settings-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { fontClasses } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FALAFEL - Student Relationship Manager",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user] = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontClasses, "--font-sans antialiased")}>
        <SettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <OfflineDialog />
              <AppSidebar />
              <main className="w-full max-w-full overflow-hidden">
                <div className="fixed top-0 z-50">
                  <div className="p-1 sticky left-0">
                    <SidebarTrigger />
                  </div>
                </div>
                <div className="p-15 max-lg:px-4 min-h-svh">{children}</div>
              </main>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
