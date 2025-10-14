import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfToday, isAfter, isSameDay } from "date-fns";
import { id } from "date-fns/locale";

interface ActivityCarouselProps {
  open: boolean;
  onClose: () => void;
}

export function ActivityCarousel({ open, onClose }: ActivityCarouselProps) {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchTodayAndUpcomingActivities();
    }
  }, [open]);

  const fetchTodayAndUpcomingActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = startOfToday();

    const { data } = await supabase
      .from("kegiatan")
      .select("*")
      .eq("user_id", user.id)
      .order("waktu_mulai", { ascending: true });

    if (data) {
      const filtered = data.filter((activity) => {
        const startDate = parseISO(activity.waktu_mulai);
        return isSameDay(startDate, today) || isAfter(startDate, today);
      });
      setActivities(filtered);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {activities.length === 0 ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Tidak ada kegiatan hari ini atau mendatang
          </h2>
        </div>
      ) : (
        <Carousel className="w-full max-w-5xl px-16">
          <CarouselContent>
            {activities.map((activity) => (
              <CarouselItem key={activity.id}>
                <div className="flex items-center justify-center min-h-[60vh] p-8">
                  <div className="text-center space-y-6">
                    <h1 className="text-5xl font-bold">{activity.nama}</h1>
                    
                    <h3 className="text-3xl text-muted-foreground">{activity.tempat}</h3>
                    
                    <h3 className="text-3xl text-muted-foreground">
                      {format(parseISO(activity.waktu_mulai), "dd MMM yyyy, HH:mm", { locale: id })} - {format(parseISO(activity.waktu_selesai), "dd MMM yyyy, HH:mm", { locale: id })}
                    </h3>
                    
                    <h4 className="text-2xl text-muted-foreground/80">{activity.penyelenggara}</h4>
                    
                    {activity.disposisi && (
                      <h4 className="text-2xl text-muted-foreground/80">{activity.disposisi}</h4>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      )}
    </div>
  );
}
