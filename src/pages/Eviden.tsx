import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Eye } from "lucide-react";

export default function Eviden() {
  const evidences = [
    {
      id: 1,
      deskripsi: "Laporan Workshop Pengembangan SDM",
      jenis_eviden: "Laporan Kegiatan",
      file_eviden: "laporan_workshop_sdm.pdf",
      kegiatan: "Workshop Pengembangan Kompetensi SDM",
      tanggal: "2025-09-17",
      ukuran: "2.4 MB"
    },
    {
      id: 2,
      deskripsi: "Notulensi Rapat Koordinasi",
      jenis_eviden: "Notulensi",
      file_eviden: "notulensi_rapat_q3.pdf",
      kegiatan: "Rapat Koordinasi Triwulan III",
      tanggal: "2025-09-20",
      ukuran: "1.1 MB"
    },
    {
      id: 3,
      deskripsi: "Sertifikat Pelatihan Teknis",
      jenis_eviden: "Sertifikat",
      file_eviden: "sertifikat_pelatihan.pdf",
      kegiatan: "Pelatihan Teknis Sistem Informasi",
      tanggal: "2025-10-03",
      ukuran: "856 KB"
    },
    {
      id: 4,
      deskripsi: "Berita Acara Monitoring",
      jenis_eviden: "Berita Acara",
      file_eviden: "ba_monitoring.pdf",
      kegiatan: "Monitoring dan Evaluasi Program",
      tanggal: "2025-09-26",
      ukuran: "1.8 MB"
    },
    {
      id: 5,
      deskripsi: "Dokumentasi Foto Kegiatan",
      jenis_eviden: "Dokumentasi",
      file_eviden: "dokumentasi_workshop.zip",
      kegiatan: "Workshop Pengembangan Kompetensi SDM",
      tanggal: "2025-09-17",
      ukuran: "15.3 MB"
    },
  ];

  const jenisEvidenColors: Record<string, string> = {
    "Laporan Kegiatan": "bg-primary/10 text-primary",
    "Notulensi": "bg-info/10 text-info",
    "Sertifikat": "bg-success/10 text-success",
    "Berita Acara": "bg-warning/10 text-warning",
    "Dokumentasi": "bg-accent/10 text-accent",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eviden</h1>
          <p className="text-muted-foreground mt-1">Kelola dokumen dan bukti kegiatan</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Eviden
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Eviden
            </CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{evidences.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Dokumen tersimpan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laporan
            </CardTitle>
            <FileText className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {evidences.filter(e => e.jenis_eviden === "Laporan Kegiatan").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Laporan kegiatan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sertifikat
            </CardTitle>
            <FileText className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {evidences.filter(e => e.jenis_eviden === "Sertifikat").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sertifikat terkumpul</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dokumentasi
            </CardTitle>
            <FileText className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {evidences.filter(e => e.jenis_eviden === "Dokumentasi").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">File dokumentasi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Eviden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {evidences.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">{item.deskripsi}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.kegiatan}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{item.file_eviden}</span>
                        <span>•</span>
                        <span>{item.ukuran}</span>
                        <span>•</span>
                        <span>{item.tanggal}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={jenisEvidenColors[item.jenis_eviden] || ""}>
                        {item.jenis_eviden}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
