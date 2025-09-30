import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, FileText } from "lucide-react";

export default function Media() {
  const mediaItems = [
    {
      id: 1,
      type: "foto",
      nama: "Pembukaan Workshop",
      kegiatan: "Workshop Pengembangan Kompetensi SDM",
      file: "pembukaan_workshop.jpg",
      tanggal: "2025-09-15"
    },
    {
      id: 2,
      type: "materi",
      nama: "Slide Presentasi Kompetensi",
      kegiatan: "Workshop Pengembangan Kompetensi SDM",
      file: "materi_kompetensi.pdf",
      tanggal: "2025-09-15"
    },
    {
      id: 3,
      type: "foto",
      nama: "Suasana Rapat",
      kegiatan: "Rapat Koordinasi Triwulan III",
      file: "rapat_koordinasi.jpg",
      tanggal: "2025-09-20"
    },
    {
      id: 4,
      type: "materi",
      nama: "Materi Pelatihan Sistem",
      kegiatan: "Pelatihan Teknis Sistem Informasi",
      file: "materi_pelatihan_si.pdf",
      tanggal: "2025-10-01"
    },
    {
      id: 5,
      type: "foto",
      nama: "Dokumentasi Monitoring",
      kegiatan: "Monitoring dan Evaluasi Program",
      file: "monitoring_lapangan.jpg",
      tanggal: "2025-09-25"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Foto & Materi</h1>
          <p className="text-muted-foreground mt-1">Kelola foto dokumentasi dan materi kegiatan</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Media
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Foto
            </CardTitle>
            <ImageIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {mediaItems.filter(m => m.type === "foto").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Foto dokumentasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Materi
            </CardTitle>
            <FileText className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {mediaItems.filter(m => m.type === "materi").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">File materi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mediaItems.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === "foto" ? (
                          <ImageIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <FileText className="h-4 w-4 text-info" />
                        )}
                        <h3 className="font-semibold text-foreground">{item.nama}</h3>
                      </div>
                      <Badge variant={item.type === "foto" ? "default" : "secondary"}>
                        {item.type === "foto" ? "Foto" : "Materi"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.kegiatan}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.file}</span>
                      <span>{item.tanggal}</span>
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
