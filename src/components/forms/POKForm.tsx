import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const pokSchema = z.object({
  nama_akun: z.string().min(1, "Nama akun wajib diisi"),
  kode_akun: z.string().min(1, "Kode akun wajib diisi"),
  jenis_akun: z.string().min(1, "Jenis akun wajib diisi"),
  uraian: z.string().min(1, "Uraian wajib diisi"),
  volume: z.string().optional(),
  satuan: z.string().optional(),
  harga: z.string().optional(),
  nilai_anggaran: z.string().min(1, "Nilai anggaran wajib diisi"),
});

type POKFormData = z.infer<typeof pokSchema>;

interface POKFormProps {
  onSuccess: () => void;
  editData?: any;
  currentVersion?: number;
}

export const POKForm = ({ onSuccess, editData, currentVersion }: POKFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<POKFormData>({
    resolver: zodResolver(pokSchema),
    defaultValues: editData ? {
      nama_akun: editData.nama_akun,
      kode_akun: editData.kode_akun,
      jenis_akun: editData.jenis_akun,
      uraian: editData.uraian,
      volume: editData.volume || "",
      satuan: editData.satuan || "",
      harga: editData.harga?.toString() || "",
      nilai_anggaran: editData.nilai_anggaran?.toString() || "",
    } : undefined,
  });

  const onSubmit = async (data: POKFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const pokData = {
        user_id: user.id,
        nama_akun: data.nama_akun,
        kode_akun: data.kode_akun,
        jenis_akun: data.jenis_akun,
        uraian: data.uraian,
        volume: data.volume || null,
        satuan: data.satuan || null,
        harga: data.harga ? parseFloat(data.harga) : null,
        nilai_anggaran: parseFloat(data.nilai_anggaran),
        versi: editData ? editData.versi : currentVersion || 1,
        tanggal_versi: editData ? editData.tanggal_versi : new Date().toISOString(),
      };

      if (editData) {
        // Update existing POK
        const { error } = await (supabase as any)
          .from("pok")
          .update(pokData)
          .eq("id", editData.id);

        if (error) throw error;
        toast({ title: "Sukses", description: "POK berhasil diperbarui" });
      } else {
        // Create new POK
        const { error } = await (supabase as any).from("pok").insert(pokData);

        if (error) throw error;
        toast({ title: "Sukses", description: "POK berhasil dibuat" });
      }

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
        <Label htmlFor="nama_akun">Nama Akun</Label>
        <Input id="nama_akun" {...register("nama_akun")} placeholder="Enter account name" className="text-sm" />
        {errors.nama_akun && <p className="text-sm text-destructive">{errors.nama_akun.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kode_akun">Kode Akun</Label>
        <Input id="kode_akun" {...register("kode_akun")} placeholder="e.g., 5211" />
        {errors.kode_akun && <p className="text-sm text-destructive">{errors.kode_akun.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenis_akun">Jenis Akun</Label>
        <Controller
          name="jenis_akun"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Belanja Bahan">Belanja Bahan</SelectItem>
                <SelectItem value="Belanja Jasa Konsultan">Belanja Jasa Konsultan</SelectItem>
                <SelectItem value="Belanja Jasa Profesi">Belanja Jasa Profesi</SelectItem>
                <SelectItem value="Belanja Perjalanan Dinas Biasa">Belanja Perjalanan Dinas Biasa</SelectItem>
                <SelectItem value="Belanja Perjalanan Dinas Dalam Kota">Belanja Perjalanan Dinas Dalam Kota</SelectItem>
                <SelectItem value="Belanja Perjalanan Dinas Paket Meeting Dalam Kota">Belanja Perjalanan Dinas Paket Meeting Dalam Kota</SelectItem>
                <SelectItem value="Belanja Modal Peralatan dan Mesin">Belanja Modal Peralatan dan Mesin</SelectItem>
                <SelectItem value="Belanja Modal Lainnya">Belanja Modal Lainnya</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.jenis_akun && <p className="text-sm text-destructive">{errors.jenis_akun.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="uraian">Uraian</Label>
        <Textarea id="uraian" {...register("uraian")} placeholder="Masukkan uraian detail" />
        {errors.uraian && <p className="text-sm text-destructive">{errors.uraian.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="volume">Volume</Label>
          <Input id="volume" {...register("volume")} placeholder="e.g., 10 ORG x 2 HR" />
          {errors.volume && <p className="text-sm text-destructive">{errors.volume.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="satuan">Satuan</Label>
          <Input id="satuan" {...register("satuan")} placeholder="e.g., PKT, OH, OJ" />
          {errors.satuan && <p className="text-sm text-destructive">{errors.satuan.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="harga">Harga Satuan</Label>
          <Input id="harga" type="number" step="0.01" {...register("harga")} placeholder="0.00" />
          {errors.harga && <p className="text-sm text-destructive">{errors.harga.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nilai_anggaran">Nilai Anggaran (Total)</Label>
        <Input id="nilai_anggaran" type="number" step="0.01" {...register("nilai_anggaran")} placeholder="0.00" />
        {errors.nilai_anggaran && <p className="text-sm text-destructive">{errors.nilai_anggaran.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (editData ? "Memperbarui..." : "Membuat...") : (editData ? "Perbarui POK" : "Buat POK")}
      </Button>
    </form>
  );
};
