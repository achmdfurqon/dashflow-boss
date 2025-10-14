import { ReactNode, useState } from "react";
import { Calendar } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { ActivityCarousel } from "@/components/ActivityCarousel";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [carouselOpen, setCarouselOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card sticky top-0 z-10">
            <SidebarTrigger className="mr-2" />
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCarouselOpen(true)}
              title="Lihat Kegiatan Hari Ini & Mendatang"
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
      <ActivityCarousel open={carouselOpen} onClose={() => setCarouselOpen(false)} />
    </SidebarProvider>
  );
}
