import { useState, useEffect } from "react";
import { X, Clock, MapPin, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import Autoplay from "embla-carousel-autoplay";

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
        <Carousel 
          className="w-full max-w-5xl px-16"
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent>
            {activities.map((activity) => (
              <CarouselItem key={activity.id}>
                <div className="flex items-center justify-center min-h-[70vh] p-8">
                  <div className="text-center space-y-8 max-w-3xl">
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
                      {activity.nama}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 text-2xl">
                      <MapPin className="h-7 w-7 text-primary" />
                      <h3 className="font-semibold text-foreground">{activity.tempat}</h3>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 text-xl">
                      <Clock className="h-6 w-6 text-primary" />
                      <h3 className="text-muted-foreground">
                        {format(parseISO(activity.waktu_mulai), "dd MMM yyyy, HH:mm", { locale: id })} - {format(parseISO(activity.waktu_selesai), "HH:mm", { locale: id })}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 text-xl">
                      <User className="h-6 w-6 text-primary" />
                      <h4 className="text-muted-foreground">{activity.penyelenggara}</h4>
                    </div>
                    
                    {activity.disposisi && (
                      <div className="flex items-center justify-center gap-3 mt-6">
                        <Badge variant="secondary" className="text-lg px-6 py-2 gap-2">
                          <Tag className="h-5 w-5" />
                          {activity.disposisi}
                        </Badge>
                      </div>
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
