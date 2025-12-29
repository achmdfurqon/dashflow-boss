import { ReactNode, useState } from "react";
import { Calendar } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { ActivityCarousel } from "@/components/ActivityCarousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useYearFilter } from "@/contexts/YearFilterContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const { selectedYear, setSelectedYear } = useYearFilter();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + 1 - i); // n+1 sampai n-3

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card sticky top-0 z-10">
            <SidebarTrigger className="mr-2" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter Tahun:</span>
              <Select
                value={selectedYear?.toString() || "all"}
                onValueChange={(value) => setSelectedYear(value === "all" ? null : parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCarouselOpen(true)}
                title="Lihat Kegiatan Hari Ini & Mendatang"
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </div>
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
