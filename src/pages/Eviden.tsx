import { useState, useEffect } from "react";
import { Plus, Search, FileText, Image, File, Pencil, Trash2 } from "lucide-react";
import { useYearFilter } from "@/contexts/YearFilterContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { EvidenForm } from "@/components/forms/EvidenForm";
import { supabase } from "@/integrations/supabase/client";
import { ManageJenisEviden } from "@/components/forms/ManageJenisEviden";
import ManageKategoriEviden from "@/components/forms/ManageKategoriEviden";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";

export default function Eviden() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [evidenItems, setEvidenItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedYear } = useYearFilter();
  const [editingEviden, setEditingEviden] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evidenToDelete, setEvidenToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEvidenItems();
  }, []);

  const fetchEvidenItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("eviden")
      .select("*, kegiatan(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setEvidenItems(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingEviden(null);
    fetchEvidenItems();
  };

  const handleDelete = async () => {
    if (!evidenToDelete) return;

    try {
      const { error } = await supabase
        .from("eviden")
        .delete()
        .eq("id", evidenToDelete);

      if (error) throw error;

      toast({ title: "Berhasil", description: "Eviden berhasil dihapus" });
      fetchEvidenItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setEvidenToDelete(null);
    }
  };

  const filteredEviden = evidenItems.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Year filter
    if (selectedYear) {
      if (item.tahun && item.tahun !== selectedYear) return false;
      if (!item.tahun) {
        const itemYear = new Date(item.created_at).getFullYear();
        if (itemYear !== selectedYear) return false;
      }
    }
    
    return matchesSearch;
  });

  const getDocIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-5 w-5" />;
      case "invoice":
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Eviden</h1>
        <p className="text-muted-foreground">Kelola dokumen dan bukti kegiatan</p>
      </div>

      <Tabs defaultValue="eviden" className="space-y-6">
        <TabsList>
          <TabsTrigger value="eviden">Daftar Eviden</TabsTrigger>
          <TabsTrigger value="jenis">Jenis Eviden</TabsTrigger>
          <TabsTrigger value="kategori">Kategori Eviden</TabsTrigger>
        </TabsList>

        <TabsContent value="eviden" className="space-y-6">
          <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEviden(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Dokumen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEviden ? "Edit Dokumen Eviden" : "Tambah Dokumen Eviden"}</DialogTitle>
            </DialogHeader>
            <EvidenForm onSuccess={handleSuccess} initialData={editingEviden} />
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Eviden</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus eviden ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEviden.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.tahun || "Tanpa tahun"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingEviden(item);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEvidenToDelete(item.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.deskripsi && (
                <p className="text-sm text-muted-foreground line-clamp-2">{item.deskripsi}</p>
              )}
              {item.kegiatan && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Kegiatan Terkait</p>
                  <p className="text-sm font-medium">{item.kegiatan.nama}</p>
                </div>
              )}
              {item.file_eviden && (
                <a 
                  href={item.file_eviden} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <File className="h-4 w-4" />
                  Lihat File
                </a>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredEviden.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada dokumen eviden ditemukan
            </CardContent>
          </Card>
        )}
      </div>
        </TabsContent>

        <TabsContent value="jenis">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Jenis Eviden</CardTitle>
            </CardHeader>
            <CardContent>
              <ManageJenisEviden />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kategori">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Kategori Eviden</CardTitle>
            </CardHeader>
            <CardContent>
              <ManageKategoriEviden />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
