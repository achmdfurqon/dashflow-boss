import { useState, useEffect } from "react";
import { Plus, Search, Download } from "lucide-react";
import { useYearFilter } from "@/contexts/YearFilterContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PencairanForm } from "@/components/forms/PencairanForm";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

export default function Pencairan() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [pencairanItems, setPencairanItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedYear } = useYearFilter();

  useEffect(() => {
    fetchPencairanItems();
  }, []);

  const fetchPencairanItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("pencairan")
      .select("*, pok(*)")
      .eq("user_id", user.id)
      .order("tgl_pencairan", { ascending: false });

    if (data) setPencairanItems(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchPencairanItems();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const filteredPencairan = pencairanItems.filter((item) => {
    const matchesSearch = 
      item.metode_pencairan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatCurrency(Number(item.nilai_pencairan)).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Year filter
    if (selectedYear) {
      const itemYear = new Date(item.tgl_spp || item.tgl_sp2d || item.tgl_pencairan || item.created_at).getFullYear();
      if (itemYear !== selectedYear) return false;
    }
    
    return matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SPP":
        return "secondary";
      case "SP2D":
        return "default";
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const exportToExcel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all pencairan with POK data
      const { data: pencairanData } = await supabase
        .from("pencairan")
        .select("*, pok(*)")
        .eq("user_id", user.id)
        .order("tgl_pencairan", { ascending: false });

      if (!pencairanData || pencairanData.length === 0) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada data pencairan untuk diekspor",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for Excel
      const excelData = pencairanData.map((item) => {
        const nilaiAnggaran = item.pok?.nilai_anggaran ? Number(item.pok.nilai_anggaran) : 0;
        const nilaiPencairan = Number(item.nilai_pencairan);
        const persentaseRealisasi = nilaiAnggaran > 0 ? (nilaiPencairan / nilaiAnggaran) * 100 : 0;

        return {
          "Kode Akun": item.pok?.kode_akun || "-",
          "Nama Akun": item.pok?.nama_akun || "-",
          "Nilai Anggaran": nilaiAnggaran,
          "Nilai Pencairan": nilaiPencairan,
          "Riil Pencairan": item.riil_pencairan ? Number(item.riil_pencairan) : "-",
          "Persentase Realisasi (%)": persentaseRealisasi.toFixed(2),
          "Metode Pencairan": item.metode_pencairan,
          "Status": item.status_pencairan,
          "Tanggal SPP": item.tgl_spp ? format(parseISO(item.tgl_spp), "dd/MM/yyyy") : "-",
          "Tanggal SP2D": item.tgl_sp2d ? format(parseISO(item.tgl_sp2d), "dd/MM/yyyy") : "-",
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      worksheet["!cols"] = [
        { wch: 15 }, // Kode Akun
        { wch: 30 }, // Nama Akun
        { wch: 20 }, // Nilai Anggaran
        { wch: 20 }, // Nilai Pencairan
        { wch: 20 }, // Riil Pencairan
        { wch: 25 }, // Persentase Realisasi
        { wch: 20 }, // Metode Pencairan
        { wch: 15 }, // Status
        { wch: 15 }, // Tanggal SPP
        { wch: 15 }, // Tanggal SP2D
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Pencairan");

      // Generate file name with current date
      const fileName = `Rekap_Pencairan_${format(new Date(), "yyyyMMdd")}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Berhasil",
        description: "File Excel berhasil diunduh",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pencairan</h1>
          <p className="text-muted-foreground">Manajemen pencairan dana kegiatan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Rekap Pencairan
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Permintaan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Permintaan Pencairan</DialogTitle>
              </DialogHeader>
              <PencairanForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan metode atau nilai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPencairan.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{item.metode_pencairan}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(item.tgl_pencairan), "dd MMMM yyyy")}
                  </p>
                </div>
                <Badge variant={getStatusVariant(item.status_pencairan)}>{item.status_pencairan}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nilai Pencairan</p>
                  <p className="font-medium text-lg">{formatCurrency(Number(item.nilai_pencairan))}</p>
                  {item.riil_pencairan && (
                    <>
                      <p className="text-muted-foreground text-xs mt-1">Riil Pencairan</p>
                      <p className="font-medium">{formatCurrency(Number(item.riil_pencairan))}</p>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">POK</p>
                  <p className="font-medium">
                    {item.pok ? `${item.pok.kode_akun} - ${item.pok.nama_akun}` : "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                {item.tgl_spp && (
                  <div>
                    <p className="text-muted-foreground">Tanggal SPP</p>
                    <p className="font-medium">{format(parseISO(item.tgl_spp), "dd MMMM yyyy")}</p>
                  </div>
                )}
                {item.tgl_sp2d && (
                  <div>
                    <p className="text-muted-foreground">Tanggal SP2D</p>
                    <p className="font-medium">{format(parseISO(item.tgl_sp2d), "dd MMMM yyyy")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPencairan.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada pencairan ditemukan
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
