import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, Package } from "lucide-react";

export default function POK() {
  const budgetItems = [
    {
      id: 1,
      nama_akun: "Belanja Perjalanan Dinas",
      kode_akun: "521211",
      jenis_akun: "Belanja Operasional",
      uraian: "Biaya perjalanan dinas dalam dan luar kota",
      nilai_anggaran: 150000000,
      terpakai: 108000000,
      persentase: 72
    },
    {
      id: 2,
      nama_akun: "Belanja Bahan",
      kode_akun: "521111",
      jenis_akun: "Belanja Operasional",
      uraian: "Pembelian bahan habis pakai dan ATK",
      nilai_anggaran: 50000000,
      terpakai: 32500000,
      persentase: 65
    },
    {
      id: 3,
      nama_akun: "Honorarium Narasumber",
      kode_akun: "521213",
      jenis_akun: "Belanja Pegawai",
      uraian: "Honor narasumber dan pembicara",
      nilai_anggaran: 75000000,
      terpakai: 56250000,
      persentase: 75
    },
    {
      id: 4,
      nama_akun: "Belanja Modal Peralatan",
      kode_akun: "532111",
      jenis_akun: "Belanja Modal",
      uraian: "Pengadaan peralatan kantor",
      nilai_anggaran: 200000000,
      terpakai: 120000000,
      persentase: 60
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalAnggaran = budgetItems.reduce((sum, item) => sum + item.nilai_anggaran, 0);
  const totalTerpakai = budgetItems.reduce((sum, item) => sum + item.terpakai, 0);
  const totalPersentase = Math.round((totalTerpakai / totalAnggaran) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">POK (Petunjuk Operasional Kegiatan)</h1>
          <p className="text-muted-foreground mt-1">Manajemen anggaran dan kode akun</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah POK
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Anggaran
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totalAnggaran)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">4 akun aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Terpakai
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totalTerpakai)}
            </div>
            <p className="text-xs text-success mt-1">{totalPersentase}% dari anggaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sisa Anggaran
            </CardTitle>
            <Package className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totalAnggaran - totalTerpakai)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{100 - totalPersentase}% tersisa</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar POK</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetItems.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{item.nama_akun}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.kode_akun}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.uraian}</p>
                        <Badge>{item.jenis_akun}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {formatCurrency(item.nilai_anggaran)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Terpakai: {formatCurrency(item.terpakai)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Realisasi</span>
                        <span className="font-medium">{item.persentase}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.persentase >= 80 ? "bg-warning" : 
                            item.persentase >= 50 ? "bg-success" : 
                            "bg-primary"
                          }`}
                          style={{ width: `${item.persentase}%` }}
                        />
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
