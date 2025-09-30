import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Sistem Manajemen Eviden & Kegiatan</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Kegiatan"
          value={156}
          icon={Calendar}
          description="Bulan ini"
          trend={{ value: 12, isPositive: true }}
          variant="info"
        />
        <StatCard
          title="Total Anggaran"
          value="Rp 2.5M"
          icon={DollarSign}
          description="POK aktif"
          variant="success"
        />
        <StatCard
          title="Pencairan Pending"
          value={23}
          icon={Clock}
          description="Menunggu proses"
          variant="warning"
        />
        <StatCard
          title="Eviden Terkumpul"
          value={432}
          icon={FileText}
          description="Dokumen lengkap"
          trend={{ value: 8, isPositive: true }}
          variant="default"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Kegiatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Selesai</span>
                </div>
                <span className="text-sm font-bold">89</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Dalam Proses</span>
                </div>
                <span className="text-sm font-bold">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Belum Mulai</span>
                </div>
                <span className="text-sm font-bold">22</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kegiatan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Workshop Pengembangan SDM", date: "28 Sep 2025", status: "Selesai" },
                { name: "Rapat Koordinasi Tim", date: "26 Sep 2025", status: "Proses" },
                { name: "Pelatihan Teknis", date: "25 Sep 2025", status: "Selesai" },
                { name: "Monitoring Lapangan", date: "24 Sep 2025", status: "Proses" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    activity.status === "Selesai" 
                      ? "bg-success/10 text-success" 
                      : "bg-warning/10 text-warning"
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Pencairan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Disetujui</span>
              <span className="font-semibold text-success">Rp 1.8M</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-success" style={{ width: "72%" }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>72% dari total anggaran</span>
              <span>Rp 2.5M</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
