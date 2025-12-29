import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Calendar as CalendarIcon, Download, FileSpreadsheet, FileText, Pencil, Trash2, MessageCircle, Copy } from "lucide-react";
import { useYearFilter } from "@/contexts/YearFilterContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KegiatanForm } from "@/components/forms/KegiatanForm";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isWithinInterval, addDays, isBefore, isSameDay, startOfDay, isAfter, isToday } from "date-fns";
import { id as localeId } from "date-fns/locale";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function Kegiatan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { selectedYear } = useYearFilter();
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("kegiatan")
      .select("*")
      .eq("user_id", user.id)
      .order("waktu_mulai", { ascending: false });

    if (data) setActivities(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingActivity(null);
    fetchActivities();
  };

  const handleDelete = async () => {
    if (!activityToDelete) return;

    try {
      const { error } = await supabase
        .from("kegiatan")
        .delete()
        .eq("id", activityToDelete);

      if (error) throw error;

      toast({ title: "Berhasil", description: "Kegiatan berhasil dihapus" });
      fetchActivities();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.nama.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Year filter
    if (selectedYear) {
      const activityYear = new Date(activity.waktu_mulai).getFullYear();
      if (activityYear !== selectedYear) return false;
    }
    
    if (!startDate || !endDate) return matchesSearch;
    
    const activityStart = parseISO(activity.waktu_mulai);
    const activityEnd = parseISO(activity.waktu_selesai);
    
    const matchesDateRange = 
      isWithinInterval(activityStart, { start: startDate, end: endDate }) ||
      isWithinInterval(activityEnd, { start: startDate, end: endDate }) ||
      (activityStart <= startDate && activityEnd >= endDate);
    
    return matchesSearch && matchesDateRange;
  });

  const downloadXLSX = () => {
    if (filteredActivities.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada kegiatan untuk diunduh",
        variant: "destructive",
      });
      return;
    }

    const data = filteredActivities.map((activity) => ({
      "Nama Kegiatan": activity.nama,
      "Jenis Kegiatan": activity.jenis_giat,
      "Waktu Mulai": format(parseISO(activity.waktu_mulai), "dd MMM yyyy, HH:mm", { locale: localeId }),
      "Waktu Selesai": format(parseISO(activity.waktu_selesai), "dd MMM yyyy, HH:mm", { locale: localeId }),
      "Tempat": activity.tempat,
      "Jenis Lokasi": activity.jenis_lokasi,
      "Penyelenggara": activity.penyelenggara,
      "Disposisi": activity.disposisi && activity.disposisi.length > 0 ? activity.disposisi.join(", ") : "-",
      "Agenda": activity.agenda || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kegiatan");
    
    const fileName = `Rekap_Kegiatan_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Berhasil",
      description: `File ${fileName} berhasil diunduh`,
    });
  };

  const downloadPDF = () => {
    if (filteredActivities.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada kegiatan untuk diunduh",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Rekap Data Kegiatan", 14, 15);
    
    if (startDate && endDate) {
      doc.setFontSize(10);
      doc.text(
        `Periode: ${format(startDate, "dd MMM yyyy", { locale: localeId })} - ${format(endDate, "dd MMM yyyy", { locale: localeId })}`,
        14,
        22
      );
    }

    const tableData = filteredActivities.map((activity) => [
      activity.nama,
      activity.jenis_giat,
      format(parseISO(activity.waktu_mulai), "dd MMM yyyy", { locale: localeId }),
      format(parseISO(activity.waktu_selesai), "dd MMM yyyy", { locale: localeId }),
      activity.tempat,
      activity.penyelenggara,
    ]);

    autoTable(doc, {
      startY: startDate && endDate ? 28 : 22,
      head: [["Nama Kegiatan", "Jenis", "Mulai", "Selesai", "Tempat", "Penyelenggara"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 133, 244] },
    });

    const fileName = `Rekap_Kegiatan_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Berhasil",
      description: `File ${fileName} berhasil diunduh`,
    });
  };

  const activitiesOnSelectedDate = activities.filter((activity) => {
    if (!selectedDate) return false;
    const startDate = parseISO(activity.waktu_mulai);
    const endDate = parseISO(activity.waktu_selesai);
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kegiatan</h1>
          <p className="text-muted-foreground">Kelola data kegiatan internal dan eksternal</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingActivity(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingActivity ? "Edit Kegiatan" : "Buat Kegiatan Baru"}</DialogTitle>
              <DialogDescription>
                {editingActivity ? "Edit data kegiatan" : "Isi form di bawah untuk membuat kegiatan baru"}
              </DialogDescription>
            </DialogHeader>
            <KegiatanForm onSuccess={handleSuccess} initialData={editingActivity} />
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Kegiatan</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Filter Range:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd MMM yyyy", { locale: localeId }) : "Tanggal Mulai"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <span className="text-muted-foreground">-</span>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd MMM yyyy", { locale: localeId }) : "Tanggal Selesai"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadXLSX}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Unduh XLSX
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPDF}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Unduh PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{activity.nama}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(parseISO(activity.waktu_mulai), "MMM dd, yyyy")} -{" "}
                        {format(parseISO(activity.waktu_selesai), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {activity.jenis_giat}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingActivity(activity);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setActivityToDelete(activity.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tempat</p>
                      <p className="font-medium">{activity.tempat}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Penyelenggara</p>
                      <p className="font-medium">{activity.penyelenggara}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Jenis Lokasi</p>
                      <p className="font-medium capitalize">{activity.jenis_lokasi}</p>
                    </div>
                  </div>
                  {activity.disposisi && activity.disposisi.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Disposisi:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.disposisi.map((d: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredActivities.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Tidak ada kegiatan ditemukan
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <MonthlyCalendar activities={activities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-6">
          <ReportView activities={filteredActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Report View Component
function ReportView({ activities }: { activities: any[] }) {
  // Expand multi-day activities to appear on each day
  const expandedActivities = useMemo(() => {
    const expanded: { activity: any; dateKey: string }[] = [];
    
    activities.forEach((activity) => {
      const startDate = startOfDay(parseISO(activity.waktu_mulai));
      const endDate = startOfDay(parseISO(activity.waktu_selesai));
      
      let currentDate = startDate;
      while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
        expanded.push({
          activity,
          dateKey: format(currentDate, "yyyy-MM-dd"),
        });
        currentDate = addDays(currentDate, 1);
      }
    });
    
    return expanded;
  }, [activities]);

  const groupedActivities = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    const sortedExpanded = [...expandedActivities].sort((a, b) => 
      new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime()
    );
    
    sortedExpanded.forEach(({ activity, dateKey }) => {
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      // Avoid duplicates if same activity appears multiple times on same day
      if (!grouped[dateKey].some(a => a.id === activity.id)) {
        grouped[dateKey].push(activity);
      }
    });
    
    return grouped;
  }, [expandedActivities]);

  // Get today and upcoming activities
  const todayAndUpcomingActivities = useMemo(() => {
    const today = startOfDay(new Date());
    const filtered: Record<string, any[]> = {};
    
    Object.entries(groupedActivities).forEach(([dateKey, dateActivities]) => {
      const date = parseISO(dateKey);
      if (isSameDay(date, today) || isAfter(date, today)) {
        filtered[dateKey] = dateActivities;
      }
    });
    
    return filtered;
  }, [groupedActivities]);

  const getDisplayTime = (activity: any, currentDateKey: string) => {
    const activityStart = parseISO(activity.waktu_mulai);
    const activityEnd = parseISO(activity.waktu_selesai);
    const currentDate = parseISO(currentDateKey);
    
    const isFirstDay = isSameDay(startOfDay(activityStart), currentDate);
    const isLastDay = isSameDay(startOfDay(activityEnd), currentDate);
    
    let displayStartTime: string;
    let displayEndTime: string;
    
    if (isFirstDay && isLastDay) {
      // Single day activity - use original times
      displayStartTime = format(activityStart, "HH:mm");
      displayEndTime = format(activityEnd, "HH:mm");
    } else if (isFirstDay) {
      // First day of multi-day - original start to 17:00
      displayStartTime = format(activityStart, "HH:mm");
      displayEndTime = "17:00";
    } else if (isLastDay) {
      // Last day of multi-day - 07:00 to original end
      displayStartTime = "07:00";
      displayEndTime = format(activityEnd, "HH:mm");
    } else {
      // Middle days - 07:00 to 17:00
      displayStartTime = "07:00";
      displayEndTime = "17:00";
    }
    
    return { displayStartTime, displayEndTime };
  };

  const generateReportText = (activitiesToReport: Record<string, any[]>) => {
    let text = "*REKAP KEGIATAN*\n\n";
    
    Object.entries(activitiesToReport).forEach(([dateKey, dateActivities]) => {
      const dateLabel = format(parseISO(dateKey), "EEEE, dd MMMM yyyy", { locale: localeId });
      text += `*${dateLabel}*\n\n`;
      
      dateActivities.forEach((activity) => {
        const { displayStartTime, displayEndTime } = getDisplayTime(activity, dateKey);
        const disposisi = activity.disposisi && activity.disposisi.length > 0 
          ? activity.disposisi.join(", ") 
          : "-";
        
        text += `${displayStartTime} - ${displayEndTime}\n`;
        text += `${activity.nama}\n`;
        text += `Penyelenggara: ${activity.penyelenggara}\n`;
        text += `Tempat: ${activity.tempat}\n`;
        text += `Disposisi: ${disposisi}\n\n`;
      });
    });
    
    return text;
  };

  const handleWhatsAppShare = () => {
    if (activities.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada kegiatan untuk dibagikan",
        variant: "destructive",
      });
      return;
    }
    
    const text = generateReportText(groupedActivities);
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  const handleCopyTodayAndUpcoming = async () => {
    if (Object.keys(todayAndUpcomingActivities).length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada kegiatan hari ini dan yang akan datang",
        variant: "destructive",
      });
      return;
    }
    
    const text = generateReportText(todayAndUpcomingActivities);
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Berhasil",
        description: "Agenda hari ini dan yang akan datang berhasil disalin",
      });
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal menyalin ke clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Rekap Kegiatan</CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleCopyTodayAndUpcoming} variant="outline" className="gap-2">
            <Copy className="h-4 w-4" />
            Salin Agenda Hari Ini & Mendatang
          </Button>
          <Button onClick={handleWhatsAppShare} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Kirim via WhatsApp
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(groupedActivities).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Tidak ada kegiatan ditemukan
          </p>
        ) : (
          Object.entries(groupedActivities).map(([dateKey, dateActivities]) => (
            <div key={dateKey} className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                {format(parseISO(dateKey), "EEEE, dd MMMM yyyy", { locale: localeId })}
              </h3>
              <div className="space-y-4 pl-4">
                {dateActivities.map((activity) => (
                  <div key={`${dateKey}-${activity.id}`} className="space-y-1">
                    <p className="font-medium text-primary">
                      {format(parseISO(activity.waktu_mulai), "HH:mm")} - {format(parseISO(activity.waktu_selesai), "HH:mm")}
                    </p>
                    <p className="font-semibold">{activity.nama}</p>
                    <p className="text-sm text-muted-foreground">
                      Penyelenggara: {activity.penyelenggara}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tempat: {activity.tempat}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Disposisi: {activity.disposisi && activity.disposisi.length > 0 
                        ? activity.disposisi.join(", ") 
                        : "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
