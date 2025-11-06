import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useYearFilter } from "@/contexts/YearFilterContext";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";

export default function Dashboard() {
  const { selectedYear } = useYearFilter();
  const { user } = useAuth();

  const { data: kegiatanStats } = useQuery({
    queryKey: ["kegiatan-stats", user?.id, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from("kegiatan")
        .select("*", { count: "exact" })
        .eq("user_id", user?.id);

      if (selectedYear) {
        const yearStart = new Date(selectedYear, 0, 1).toISOString();
        const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();
        query = query.gte("waktu_mulai", yearStart).lte("waktu_mulai", yearEnd);
      }

      const { data, count } = await query;

      const now = new Date();
      const completed = data?.filter(k => new Date(k.waktu_selesai) < now).length || 0;
      const ongoing = data?.filter(k => {
        const start = new Date(k.waktu_mulai);
        const end = new Date(k.waktu_selesai);
        return start <= now && now <= end;
      }).length || 0;
      const upcoming = data?.filter(k => new Date(k.waktu_mulai) > now).length || 0;

      return {
        total: count || 0,
        completed,
        ongoing,
        upcoming,
        recent: data?.sort((a, b) => 
          new Date(b.waktu_mulai).getTime() - new Date(a.waktu_mulai).getTime()
        ).slice(0, 4) || []
      };
    },
    enabled: !!user,
  });

  const { data: pokStats } = useQuery({
    queryKey: ["pok-stats", user?.id, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from("pok")
        .select("nilai_anggaran")
        .eq("user_id", user?.id);

      if (selectedYear) {
        query = query.eq("tahun", selectedYear);
      }

      const { data } = await query;
      const total = data?.reduce((sum, pok) => sum + Number(pok.nilai_anggaran), 0) || 0;

      return {
        total,
        formatted: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(total),
      };
    },
    enabled: !!user,
  });

  const { data: pencairanStats } = useQuery({
    queryKey: ["pencairan-stats", user?.id, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from("pencairan")
        .select("status_pencairan, riil_pencairan, nilai_pencairan")
        .eq("user_id", user?.id);

      if (selectedYear) {
        const yearStart = new Date(selectedYear, 0, 1).toISOString();
        const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();
        query = query.gte("tgl_pencairan", yearStart).lte("tgl_pencairan", yearEnd);
      }

      const { data } = await query;
      
      const pending = data?.filter(p => p.status_pencairan === "pending").length || 0;
      const approved = data?.reduce((sum, p) => 
        p.status_pencairan === "approved" ? sum + Number(p.riil_pencairan || p.nilai_pencairan) : sum, 0
      ) || 0;

      return {
        pending,
        approved,
        approvedFormatted: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(approved),
      };
    },
    enabled: !!user,
  });

  const { data: evidenStats } = useQuery({
    queryKey: ["eviden-stats", user?.id, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from("eviden")
        .select("*", { count: "exact" })
        .eq("user_id", user?.id);

      if (selectedYear) {
        query = query.eq("tahun", selectedYear);
      }

      const { count } = await query;
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: monthlyActivityData } = useQuery({
    queryKey: ["monthly-activity", user?.id, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from("kegiatan")
        .select("waktu_mulai")
        .eq("user_id", user?.id);

      if (selectedYear) {
        const yearStart = new Date(selectedYear, 0, 1).toISOString();
        const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();
        query = query.gte("waktu_mulai", yearStart).lte("waktu_mulai", yearEnd);
      }

      const { data } = await query;
      
      const monthlyCount: Record<number, number> = {};
      data?.forEach((item) => {
        const month = new Date(item.waktu_mulai).getMonth();
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      });

      return Array.from({ length: 12 }, (_, i) => ({
        month: format(new Date(2024, i, 1), "MMM"),
        kegiatan: monthlyCount[i] || 0,
      }));
    },
    enabled: !!user,
  });

  const { data: monthlyBudgetData } = useQuery({
    queryKey: ["monthly-budget", user?.id, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from("pencairan")
        .select("tgl_pencairan, riil_pencairan, nilai_pencairan, status_pencairan")
        .eq("user_id", user?.id);

      if (selectedYear) {
        const yearStart = new Date(selectedYear, 0, 1).toISOString();
        const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();
        query = query.gte("tgl_pencairan", yearStart).lte("tgl_pencairan", yearEnd);
      }

      const { data } = await query;
      
      const monthlyBudget: Record<number, number> = {};
      data?.forEach((item) => {
        if (item.status_pencairan === "approved") {
          const month = new Date(item.tgl_pencairan).getMonth();
          const amount = Number(item.riil_pencairan || item.nilai_pencairan);
          monthlyBudget[month] = (monthlyBudget[month] || 0) + amount;
        }
      });

      return Array.from({ length: 12 }, (_, i) => ({
        month: format(new Date(2024, i, 1), "MMM"),
        anggaran: monthlyBudget[i] || 0,
      }));
    },
    enabled: !!user,
  });

  const getActivityStatus = (activity: any) => {
    const now = new Date();
    const start = new Date(activity.waktu_mulai);
    const end = new Date(activity.waktu_selesai);
    
    if (end < now) return "Selesai";
    if (start <= now && now <= end) return "Proses";
    return "Belum Mulai";
  };

  const totalBudget = pokStats?.total || 0;
  const approvedAmount = pencairanStats?.approved || 0;
  const percentage = totalBudget > 0 ? (approvedAmount / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Sistem Manajemen Eviden & Kegiatan</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Kegiatan"
          value={kegiatanStats?.total || 0}
          icon={Calendar}
          description={selectedYear ? `Tahun ${selectedYear}` : "Semua tahun"}
          variant="info"
        />
        <StatCard
          title="Total Anggaran"
          value={pokStats?.formatted || "Rp 0"}
          icon={DollarSign}
          description="POK aktif"
          variant="success"
        />
        <StatCard
          title="Pencairan Pending"
          value={pencairanStats?.pending || 0}
          icon={Clock}
          description="Menunggu proses"
          variant="warning"
        />
        <StatCard
          title="Eviden Terkumpul"
          value={evidenStats || 0}
          icon={FileText}
          description="Dokumen lengkap"
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
                <span className="text-sm font-bold">{kegiatanStats?.completed || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Dalam Proses</span>
                </div>
                <span className="text-sm font-bold">{kegiatanStats?.ongoing || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Belum Mulai</span>
                </div>
                <span className="text-sm font-bold">{kegiatanStats?.upcoming || 0}</span>
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
              {kegiatanStats?.recent && kegiatanStats.recent.length > 0 ? (
                kegiatanStats.recent.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.nama}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(activity.waktu_mulai), "dd MMM yyyy")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      getActivityStatus(activity) === "Selesai" 
                        ? "bg-success/10 text-success" 
                        : getActivityStatus(activity) === "Proses"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {getActivityStatus(activity)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada kegiatan</p>
              )}
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
              <span className="font-semibold text-success">{pencairanStats?.approvedFormatted || "Rp 0"}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-success" style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentage.toFixed(0)}% dari total anggaran</span>
              <span>{pokStats?.formatted || "Rp 0"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tren Kegiatan per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                kegiatan: {
                  label: "Kegiatan",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="kegiatan" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tren Pencairan per Bulan</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                anggaran: {
                  label: "Pencairan",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={monthlyBudgetData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(value as number)}
                  />} 
                />
                <Line 
                  type="monotone" 
                  dataKey="anggaran" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
