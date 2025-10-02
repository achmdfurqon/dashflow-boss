import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const pokSchema = z.object({
  nama_akun: z.string().min(1, "Account name is required"),
  kode_akun: z.string().min(1, "Account code is required"),
  jenis_akun: z.string().min(1, "Account type is required"),
  uraian: z.string().min(1, "Description is required"),
  nilai_anggaran: z.string().min(1, "Budget amount is required"),
});

type POKFormData = z.infer<typeof pokSchema>;

interface POKFormProps {
  onSuccess: () => void;
}

export const POKForm = ({ onSuccess }: POKFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<POKFormData>({
    resolver: zodResolver(pokSchema),
  });

  const onSubmit = async (data: POKFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase as any).from("pok").insert({
        user_id: user.id,
        nama_akun: data.nama_akun,
        kode_akun: data.kode_akun,
        jenis_akun: data.jenis_akun,
        uraian: data.uraian,
        nilai_anggaran: parseFloat(data.nilai_anggaran),
      });

      if (error) throw error;

      toast({ title: "Success", description: "POK created successfully" });
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
        <Input id="nama_akun" {...register("nama_akun")} placeholder="Enter account name" />
        {errors.nama_akun && <p className="text-sm text-destructive">{errors.nama_akun.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kode_akun">Kode Akun</Label>
        <Input id="kode_akun" {...register("kode_akun")} placeholder="e.g., 5211" />
        {errors.kode_akun && <p className="text-sm text-destructive">{errors.kode_akun.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenis_akun">Jenis Akun</Label>
        <Input id="jenis_akun" {...register("jenis_akun")} placeholder="e.g., UP, TUP, LS, SPP, SPP2D" />
        {errors.jenis_akun && <p className="text-sm text-destructive">{errors.jenis_akun.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="uraian">Uraian</Label>
        <Textarea id="uraian" {...register("uraian")} placeholder="Enter description" />
        {errors.uraian && <p className="text-sm text-destructive">{errors.uraian.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nilai_anggaran">Nilai Anggaran</Label>
        <Input id="nilai_anggaran" type="number" step="0.01" {...register("nilai_anggaran")} placeholder="0.00" />
        {errors.nilai_anggaran && <p className="text-sm text-destructive">{errors.nilai_anggaran.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create POK"}
      </Button>
    </form>
  );
};
