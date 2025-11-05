import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ManageJenisEviden } from "./ManageJenisEviden";

const evidenSchema = z.object({
  title: z.string().min(1, "Nama eviden harus diisi"),
  tipe_eviden: z.enum(["foto", "dokumen"]),
  id_ref_kategori: z.string().optional(),
  id_ref_eviden: z.string().min(1, "Jenis eviden harus dipilih"),
  file_eviden: z.string().optional(),
  deskripsi: z.string().optional(),
  id_pok: z.string().optional(),
  id_giat: z.string().optional(),
  tahun: z.string().optional(),
});

type EvidenFormData = z.infer<typeof evidenSchema>;

interface EvidenFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export const EvidenForm = ({ onSuccess, initialData }: EvidenFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [pokList, setPokList] = useState<any[]>([]);
  const [refEvidenList, setRefEvidenList] = useState<any[]>([]);
  const [refKategoriList, setRefKategoriList] = useState<any[]>([]);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedPok, setSelectedPok] = useState<string>();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EvidenFormData>({
    resolver: zodResolver(evidenSchema),
  });

  useEffect(() => {
    fetchKegiatanList();
    fetchRefEvidenList();
    fetchRefKategoriList();
    fetchPokList();
    
    if (initialData) {
      setValue("title", initialData.title);
      setValue("tipe_eviden", initialData.tipe_eviden);
      setValue("id_ref_kategori", initialData.id_ref_kategori);
      setValue("id_ref_eviden", initialData.id_ref_eviden);
      setValue("file_eviden", initialData.file_eviden);
      setValue("deskripsi", initialData.deskripsi);
      setValue("id_pok", initialData.id_pok);
      setValue("id_giat", initialData.id_giat);
      setValue("tahun", initialData.tahun?.toString());
      
      if (initialData.id_pok) {
        setSelectedPok(initialData.id_pok);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (selectedPok) {
      fetchKegiatanList();
    }
  }, [selectedPok]);

  const fetchKegiatanList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("kegiatan")
      .select("*")
      .eq("user_id", user.id);
    
    if (selectedPok) {
      query = query.eq("id_pok", selectedPok);
    }

    const { data } = await query;
    if (data) setKegiatanList(data);
  };

  const fetchPokList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("pok")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setPokList(data);
  };

  const fetchRefEvidenList = async () => {
    const { data } = await (supabase as any)
      .from("ref_eviden")
      .select("*");
    
    if (data) setRefEvidenList(data);
  };

  const fetchRefKategoriList = async () => {
    const { data } = await supabase
      .from("ref_kategori_eviden")
      .select("*")
      .order("kategori_eviden");
    
    if (data) setRefKategoriList(data);
  };

  const onSubmit = async (data: EvidenFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        title: data.title,
        tipe_eviden: data.tipe_eviden,
        id_ref_kategori: data.id_ref_kategori || null,
        id_ref_eviden: data.id_ref_eviden,
        file_eviden: data.file_eviden || null,
        deskripsi: data.deskripsi || null,
        id_pok: data.id_pok || null,
        id_giat: data.id_giat || null,
        tahun: data.tahun ? parseInt(data.tahun) : null,
      };

      let error;
      if (initialData) {
        const result = await (supabase as any)
          .from("eviden")
          .update(payload)
          .eq("id", initialData.id);
        error = result.error;
      } else {
        const result = await (supabase as any).from("eviden").insert({
          ...payload,
          user_id: user.id,
        });
        error = result.error;
      }

      if (error) throw error;

      toast({ 
        title: "Berhasil", 
        description: initialData ? "Eviden berhasil diubah" : "Eviden berhasil dibuat" 
      });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Nama Eviden</Label>
        <Input id="title" {...register("title")} placeholder="Masukkan nama eviden" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipe_eviden">Tipe Eviden</Label>
        <Select onValueChange={(value) => setValue("tipe_eviden", value as "foto" | "dokumen")}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe eviden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="foto">Foto</SelectItem>
            <SelectItem value="dokumen">Dokumen</SelectItem>
          </SelectContent>
        </Select>
        {errors.tipe_eviden && <p className="text-sm text-destructive">{errors.tipe_eviden.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_ref_kategori">Kategori Eviden (opsional)</Label>
        <Select onValueChange={(value) => setValue("id_ref_kategori", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori eviden" />
          </SelectTrigger>
          <SelectContent>
            {refKategoriList.map((kategori) => (
              <SelectItem key={kategori.id} value={kategori.id}>
                {kategori.kategori_eviden}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="id_ref_eviden">Jenis Eviden</Label>
          <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Kelola
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kelola Jenis Eviden</DialogTitle>
              </DialogHeader>
              <ManageJenisEviden onUpdate={fetchRefEvidenList} />
            </DialogContent>
          </Dialog>
        </div>
        <Select onValueChange={(value) => setValue("id_ref_eviden", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis eviden" />
          </SelectTrigger>
          <SelectContent>
            {refEvidenList.map((ref) => (
              <SelectItem key={ref.id} value={ref.id}>
                {ref.jenis_eviden}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.id_ref_eviden && <p className="text-sm text-destructive">{errors.id_ref_eviden.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file_eviden">File Eviden (opsional)</Label>
        <Input id="file_eviden" {...register("file_eviden")} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi (opsional)</Label>
        <Textarea id="deskripsi" {...register("deskripsi")} placeholder="Masukkan deskripsi" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_pok">POK (opsional)</Label>
        <Select onValueChange={(value) => {
          setValue("id_pok", value);
          setSelectedPok(value);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih POK" />
          </SelectTrigger>
          <SelectContent>
            {pokList.map((pok) => (
              <SelectItem key={pok.id} value={pok.id}>
                {pok.kode_akun} - {pok.nama_akun}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_giat">Kegiatan (opsional)</Label>
        <Select onValueChange={(value) => setValue("id_giat", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kegiatan" />
          </SelectTrigger>
          <SelectContent>
            {kegiatanList.map((kegiatan) => (
              <SelectItem key={kegiatan.id} value={kegiatan.id}>
                {kegiatan.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tahun">Tahun (opsional)</Label>
        <Input 
          id="tahun" 
          type="number" 
          {...register("tahun")} 
          placeholder="2025" 
          min="2000"
          max="2100"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : (initialData ? "Update Eviden" : "Simpan Eviden")}
      </Button>
    </form>
  );
};
