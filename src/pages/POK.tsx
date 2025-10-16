import { useState, useEffect } from "react";
import { Plus, Search, Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { POKForm } from "@/components/forms/POKForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function POK() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pokItems, setPokItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPOK, setEditingPOK] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchPOKItems();
  }, []);

  const fetchPOKItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("pok")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setPokItems(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditDialogOpen(false);
    setEditingPOK(null);
    fetchPOKItems();
  };

  const handleEdit = (pok: any) => {
    setEditingPOK(pok);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pok")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("POK berhasil dihapus");
      fetchPOKItems();
    } catch (error: any) {
      toast.error("Gagal menghapus POK: " + error.message);
    }
  };

  const filteredPOK = pokItems.filter((item) =>
    item.kode_akun.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_akun.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.uraian.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const generateXLSX = () => {
    if (filteredPOK.length === 0) {
      toast.error("Tidak ada data POK untuk diunduh");
      return;
    }

    const worksheetData = [
      ["KODE", "URAIAN", "VOLUME", "SATUAN", "HARGA", "TOTAL", "VERSI", "TANGGAL VERSI"],
      ...filteredPOK.map((pok) => [
        pok.kode_akun,
        `${pok.nama_akun} - ${pok.uraian}`,
        pok.volume || "",
        pok.satuan || "",
        pok.harga ? Number(pok.harga) : "",
        Number(pok.nilai_anggaran),
        pok.versi || 1,
        new Date(pok.tanggal_versi || pok.created_at).toLocaleDateString('id-ID')
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // KODE
      { wch: 50 }, // URAIAN
      { wch: 15 }, // VOLUME
      { wch: 10 }, // SATUAN
      { wch: 15 }, // HARGA
      { wch: 15 }, // TOTAL
      { wch: 10 }, // VERSI
      { wch: 15 }, // TANGGAL VERSI
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "POK");
    XLSX.writeFile(wb, `POK_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("File XLSX berhasil diunduh");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">POK Management</h1>
          <p className="text-muted-foreground">Manajemen anggaran dan kode akun</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateXLSX}>
            <Download className="mr-2 h-4 w-4" />
            Generate XLSX
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah POK
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat POK Baru</DialogTitle>
              </DialogHeader>
              <POKForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari POK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPOK.map((pok) => {
          const usagePercentage = 0; // Will be calculated based on pencairan records
          return (
            <Card key={pok.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-sm font-mono">{pok.kode_akun}</span>
                      <span>-</span>
                      <span>{pok.nama_akun}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{pok.uraian}</p>
                    <p className="text-xs text-muted-foreground mt-1">Jenis: {pok.jenis_akun}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">v{pok.versi || 1}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(pok)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus POK?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus POK "{pok.nama_akun}"? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(pok.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Volume</p>
                    <p className="font-medium">{pok.volume || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Satuan</p>
                    <p className="font-medium">{pok.satuan || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harga</p>
                    <p className="font-medium">{pok.harga ? formatCurrency(Number(pok.harga)) : "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nilai Anggaran</p>
                    <p className="font-medium">{formatCurrency(Number(pok.nilai_anggaran))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal Versi</p>
                    <p className="font-medium">{new Date(pok.tanggal_versi || pok.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dibuat</p>
                    <p className="font-medium">{new Date(pok.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredPOK.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada POK ditemukan
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit POK</DialogTitle>
          </DialogHeader>
          <POKForm onSuccess={handleSuccess} editData={editingPOK} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
