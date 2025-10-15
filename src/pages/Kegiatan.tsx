import { useState, useEffect } from "react";
import { Plus, Search, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { KegiatanForm } from "@/components/forms/KegiatanForm";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

export default function Kegiatan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

  const filteredActivities = activities.filter((activity) =>
    activity.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
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
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kalender Kegiatan</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    hasActivity: (date) =>
                      activities.some((activity) => {
                        const startDate = parseISO(activity.waktu_mulai);
                        const endDate = parseISO(activity.waktu_selesai);
                        return date >= startDate && date <= endDate;
                      }),
                  }}
                  modifiersStyles={{
                    hasActivity: {
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      fontWeight: "bold",
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <CalendarIcon className="inline mr-2 h-5 w-5" />
                  {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Pilih tanggal"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activitiesOnSelectedDate.length > 0 ? (
                    activitiesOnSelectedDate.map((activity) => (
                      <div key={activity.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{activity.nama}</h3>
                          <Badge variant="default">
                            {activity.jenis_giat}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.tempat}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(activity.waktu_mulai), "MMM dd")} -{" "}
                          {format(parseISO(activity.waktu_selesai), "MMM dd, yyyy")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Tidak ada kegiatan pada tanggal ini
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
