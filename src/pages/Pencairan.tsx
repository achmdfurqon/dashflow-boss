import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, XCircle, Calendar } from "lucide-react";

export default function Pencairan() {
  const disbursements = [
    {
      id: 1,
      nilai_pencairan: 45000000,
      metode_pencairan: "Transfer Bank",
      status_pencairan: "Disetujui",
      tgl_pencairan: "2025-09-25",
      pok_nama: "Belanja Perjalanan Dinas",
      kode_akun: "521211"
    },
    {
      id: 2,
      nilai_pencairan: 15000000,
      metode_pencairan: "Transfer Bank",
      status_pencairan: "Pending",
      tgl_pencairan: "2025-09-28",
      pok_nama: "Belanja Bahan",
      kode_akun: "521111"
    },
    {
      id: 3,
      nilai_pencairan: 22500000,
      metode_pencairan: "Tunai",
      status_pencairan: "Disetujui",
      tgl_pencairan: "2025-09-20",
      pok_nama: "Honorarium Narasumber",
      kode_akun: "521213"
    },
    {
      id: 4,
      nilai_pencairan: 80000000,
      metode_pencairan: "Transfer Bank",
      status_pencairan: "Ditolak",
      tgl_pencairan: "2025-09-18",
      pok_nama: "Belanja Modal Peralatan",
      kode_akun: "532111"
    },
    {
      id: 5,
      nilai_pencairan: 12000000,
      metode_pencairan: "Transfer Bank",
      status_pencairan: "Pending",
      tgl_pencairan: "2025-09-30",
      pok_nama: "Belanja Perjalanan Dinas",
      kode_akun: "521211"
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Disetujui":
        return <CheckCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Ditolak":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Disetujui":
        return "default";
      case "Pending":
        return "secondary";
      case "Ditolak":
        return "destructive";
      default:
        return "outline";
    }
  };

  const totalDisetujui = disbursements
    .filter(d => d.status_pencairan === "Disetujui")
    .reduce((sum, d) => sum + d.nilai_pencairan, 0);

  const totalPending = disbursements
    .filter(d => d.status_pencairan === "Pending")
    .reduce((sum, d) => sum + d.nilai_pencairan, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pencairan</h1>
          <p className="text-muted-foreground mt-1">Manajemen pencairan dana kegiatan</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pencairan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Disetujui
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totalDisetujui)}
            </div>
            <p className="text-xs text-success mt-1">
              {disbursements.filter(d => d.status_pencairan === "Disetujui").length} pencairan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Persetujuan
            </CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-warning mt-1">
              {disbursements.filter(d => d.status_pencairan === "Pending").length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ditolak
            </CardTitle>
            <XCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {disbursements.filter(d => d.status_pencairan === "Ditolak").length}
            </div>
            <p className="text-xs text-destructive mt-1">Pencairan ditolak</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pencairan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {disbursements.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{item.pok_nama}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.kode_akun}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{item.tgl_pencairan}</span>
                        </div>
                        <span>•</span>
                        <span>{item.metode_pencairan}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {formatCurrency(item.nilai_pencairan)}
                        </div>
                      </div>
                      <Badge 
                        variant={getStatusVariant(item.status_pencairan)}
                        className="gap-1"
                      >
                        {getStatusIcon(item.status_pencairan)}
                        {item.status_pencairan}
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
