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
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

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

    if (data) {
      setPokItems(data);
      // Get the highest version
      const maxVersion = data.reduce((max, item) => Math.max(max, item.versi || 1), 1);
      setCurrentVersion(maxVersion);
    }
  };

  const handleCreateNewVersion = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newVersion = currentVersion + 1;
    
    // Get all POK items from current version
    const currentVersionItems = pokItems.filter(item => item.versi === currentVersion);
    
    if (currentVersionItems.length === 0) {
      toast.error("Tidak ada data POK untuk diduplikat");
      return;
    }

    // Duplicate all items with new version
    const duplicatedItems = currentVersionItems.map(item => ({
      user_id: user.id,
      kode_akun: item.kode_akun,
      nama_akun: item.nama_akun,
      jenis_akun: item.jenis_akun,
      uraian: item.uraian,
      volume: item.volume,
      satuan: item.satuan,
      harga: item.harga,
      nilai_anggaran: item.nilai_anggaran,
      versi: newVersion,
      tanggal_versi: new Date().toISOString()
    }));

    const { error } = await supabase
      .from("pok")
      .insert(duplicatedItems);

    if (error) {
      toast.error("Gagal membuat versi baru: " + error.message);
      return;
    }

    setCurrentVersion(newVersion);
    toast.success(`Versi POK ${newVersion} dibuat dengan ${duplicatedItems.length} item`);
    fetchPOKItems();
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

  const handleGenerateXLSX = () => {
    setVersionDialogOpen(true);
  };

  const generateXLSX = () => {
    if (selectedVersion === null) {
      toast.error("Pilih versi POK terlebih dahulu");
      return;
    }

    const versionPOK = pokItems.filter(item => item.versi === selectedVersion);
    
    if (versionPOK.length === 0) {
      toast.error(`Tidak ada data POK untuk versi ${selectedVersion}`);
      return;
    }

    const worksheetData = [
      ["KODE", "URAIAN", "VOLUME", "SATUAN", "HARGA", "TOTAL", "VERSI", "TANGGAL VERSI"],
      ...versionPOK.map((pok) => [
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
    XLSX.writeFile(wb, `POK_V${selectedVersion}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success(`File XLSX Versi ${selectedVersion} berhasil diunduh`);
    setVersionDialogOpen(false);
    setSelectedVersion(null);
  };

  const availableVersions = Array.from(new Set(pokItems.map(item => item.versi || 1))).sort((a, b) => b - a);
  
  const getComparisonData = () => {
    const maxVersion = Math.max(...availableVersions);
    const versions = {
      v1: pokItems.filter(item => item.versi === 1),
      vPrev: pokItems.filter(item => item.versi === maxVersion - 1),
      vCurrent: pokItems.filter(item => item.versi === maxVersion)
    };
    return { versions, maxVersion };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">POK Management</h1>
          <p className="text-muted-foreground">Manajemen anggaran dan kode akun</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleCreateNewVersion}>
            <Plus className="mr-2 h-4 w-4" />
            Buat POK
          </Button>
          <Button variant="outline" onClick={() => setCompareDialogOpen(true)}>
            Bandingkan Versi
          </Button>
          <Button variant="outline" onClick={handleGenerateXLSX}>
            <Download className="mr-2 h-4 w-4" />
            Generate XLSX
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Rincian
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Rincian POK</DialogTitle>
              </DialogHeader>
              <POKForm onSuccess={handleSuccess} currentVersion={currentVersion} />
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
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="text-xs font-mono">{pok.kode_akun}</span>
                      <span>-</span>
                      <span className="text-sm">{pok.nama_akun}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{pok.uraian}</p>
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
                <div className="grid grid-cols-3 gap-4 text-xs">
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
                <div className="grid grid-cols-3 gap-4 text-xs">
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

      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Versi POK</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pilih versi POK yang ingin diunduh:
            </p>
            <div className="grid gap-2">
              {availableVersions.map((version) => (
                <Button
                  key={version}
                  variant={selectedVersion === version ? "default" : "outline"}
                  onClick={() => setSelectedVersion(version)}
                  className="w-full justify-start"
                >
                  Versi {version}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setVersionDialogOpen(false);
                setSelectedVersion(null);
              }}>
                Batal
              </Button>
              <Button onClick={generateXLSX} disabled={selectedVersion === null}>
                Download XLSX
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perbandingan Versi POK</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const { versions, maxVersion } = getComparisonData();
              return (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Versi 1</h3>
                    <div className="space-y-2">
                      {versions.v1.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada data</p>
                      ) : (
                        versions.v1.map((pok) => (
                          <Card key={pok.id}>
                            <CardContent className="p-3">
                              <p className="text-sm font-mono">{pok.kode_akun}</p>
                              <p className="text-sm font-medium">{pok.nama_akun}</p>
                              <p className="text-xs text-muted-foreground">{pok.uraian}</p>
                              <p className="text-sm font-semibold mt-1">{formatCurrency(Number(pok.nilai_anggaran))}</p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                      <p className="text-sm font-semibold mt-2">
                        Total: {formatCurrency(versions.v1.reduce((sum, pok) => sum + Number(pok.nilai_anggaran), 0))}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Versi {maxVersion - 1}</h3>
                    <div className="space-y-2">
                      {versions.vPrev.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada data</p>
                      ) : (
                        versions.vPrev.map((pok) => (
                          <Card key={pok.id}>
                            <CardContent className="p-3">
                              <p className="text-sm font-mono">{pok.kode_akun}</p>
                              <p className="text-sm font-medium">{pok.nama_akun}</p>
                              <p className="text-xs text-muted-foreground">{pok.uraian}</p>
                              <p className="text-sm font-semibold mt-1">{formatCurrency(Number(pok.nilai_anggaran))}</p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                      <p className="text-sm font-semibold mt-2">
                        Total: {formatCurrency(versions.vPrev.reduce((sum, pok) => sum + Number(pok.nilai_anggaran), 0))}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Versi {maxVersion}</h3>
                    <div className="space-y-2">
                      {versions.vCurrent.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada data</p>
                      ) : (
                        versions.vCurrent.map((pok) => (
                          <Card key={pok.id}>
                            <CardContent className="p-3">
                              <p className="text-sm font-mono">{pok.kode_akun}</p>
                              <p className="text-sm font-medium">{pok.nama_akun}</p>
                              <p className="text-xs text-muted-foreground">{pok.uraian}</p>
                              <p className="text-sm font-semibold mt-1">{formatCurrency(Number(pok.nilai_anggaran))}</p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                      <p className="text-sm font-semibold mt-2">
                        Total: {formatCurrency(versions.vCurrent.reduce((sum, pok) => sum + Number(pok.nilai_anggaran), 0))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
