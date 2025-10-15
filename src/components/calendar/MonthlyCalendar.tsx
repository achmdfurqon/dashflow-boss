import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfDay, endOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  nama: string;
  waktu_mulai: string;
  waktu_selesai: string;
  jenis_giat: string;
  tempat: string;
  penyelenggara: string;
}

interface MonthlyCalendarProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

const ACTIVITY_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
];

export function MonthlyCalendar({ activities, onActivityClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days to display (including padding days)
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getActivitiesForDay = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    
    return activities.filter((activity) => {
      const activityStart = parseISO(activity.waktu_mulai);
      const activityEnd = parseISO(activity.waktu_selesai);
      
      return (
        (activityStart >= dayStart && activityStart <= dayEnd) ||
        (activityEnd >= dayStart && activityEnd <= dayEnd) ||
        (activityStart <= dayStart && activityEnd >= dayEnd)
      );
    });
  };

  const getActivityColor = (activityId: string) => {
    const hash = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ACTIVITY_COLORS[hash % ACTIVITY_COLORS.length];
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy", { locale: localeId })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayActivities = getActivitiesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[120px] border-r border-b last:border-r-0 p-2",
                  !isCurrentMonth && "bg-muted/20",
                  isCurrentMonth && "bg-background"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    isToday && "inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground",
                    !isCurrentMonth && "text-muted-foreground",
                    isCurrentMonth && !isToday && "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {dayActivities.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => onActivityClick?.(activity)}
                      className={cn(
                        "text-xs p-1 rounded cursor-pointer truncate text-white",
                        getActivityColor(activity.id),
                        "hover:opacity-80 transition-opacity"
                      )}
                      title={activity.nama}
                    >
                      <div className="font-medium truncate">
                        {format(parseISO(activity.waktu_mulai), "HH:mm")} {activity.nama}
                      </div>
                    </div>
                  ))}
                  {dayActivities.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayActivities.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
