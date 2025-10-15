import { useState, useEffect } from "react";
import { Plus, Search, Calendar as CalendarIcon, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KegiatanForm } from "@/components/forms/KegiatanForm";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isWithinInterval } from "date-fns";
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
    fetchActivities();
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.nama.toLowerCase().includes(searchQuery.toLowerCase());
    
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
      "Disposisi": activity.disposisi || "-",
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Kegiatan Baru</DialogTitle>
              <DialogDescription>
                Isi form di bawah untuk membuat kegiatan baru
              </DialogDescription>
            </DialogHeader>
            <KegiatanForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
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
                    <div>
                      <CardTitle>{activity.nama}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(parseISO(activity.waktu_mulai), "MMM dd, yyyy")} -{" "}
                        {format(parseISO(activity.waktu_selesai), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge variant="default">
                      {activity.jenis_giat}
                    </Badge>
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
      </Tabs>
    </div>
  );
}
