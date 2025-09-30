import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, MapPin, FileText } from "lucide-react";

export default function Kegiatan() {
  const [searchQuery, setSearchQuery] = useState("");

  const activities = [
    {
      id: 1,
      nama: "Workshop Pengembangan Kompetensi SDM",
      jenis_giat: "Internal",
      waktu_mulai: "2025-09-15",
      waktu_selesai: "2025-09-17",
      jenis_lokasi: "Hotel",
      tempat: "Hotel Grand Mercure Jakarta",
      status: "Selesai",
      penyelenggara: "Divisi HRD"
    },
    {
      id: 2,
      nama: "Rapat Koordinasi Triwulan III",
      jenis_giat: "Internal",
      waktu_mulai: "2025-09-20",
      waktu_selesai: "2025-09-20",
      jenis_lokasi: "Kantor",
      tempat: "Ruang Meeting Lt. 5",
      status: "Dalam Proses",
      penyelenggara: "Sekretariat"
    },
    {
      id: 3,
      nama: "Pelatihan Teknis Sistem Informasi",
      jenis_giat: "Eksternal",
      waktu_mulai: "2025-10-01",
      waktu_selesai: "2025-10-03",
      jenis_lokasi: "Virtual",
      tempat: "Zoom Meeting",
      status: "Belum Mulai",
      penyelenggara: "IT Department"
    },
    {
      id: 4,
      nama: "Monitoring dan Evaluasi Program",
      jenis_giat: "Eksternal",
      waktu_mulai: "2025-09-25",
      waktu_selesai: "2025-09-26",
      jenis_lokasi: "Kantor",
      tempat: "Lokasi Proyek Lapangan",
      status: "Dalam Proses",
      penyelenggara: "Tim Monitoring"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kegiatan</h1>
          <p className="text-muted-foreground mt-1">Kelola data kegiatan internal dan eksternal</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Kegiatan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">{activity.nama}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{activity.waktu_mulai} - {activity.waktu_selesai}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{activity.tempat}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" />
                              <span>Penyelenggara: {activity.penyelenggara}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={activity.jenis_giat === "Internal" ? "default" : "secondary"}>
                        {activity.jenis_giat}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={
                          activity.status === "Selesai" 
                            ? "border-success text-success" 
                            : activity.status === "Dalam Proses"
                            ? "border-warning text-warning"
                            : "border-muted-foreground text-muted-foreground"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
