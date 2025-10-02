import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nonKegiatanSchema = z.object({
  nama_non_giat: z.string().min(1, "Name is required"),
  jenis_non_giat: z.string().min(1, "Type is required"),
  id_non_giat_sblm: z.string().optional(),
  id_pok: z.string().optional(),
});

type NonKegiatanFormData = z.infer<typeof nonKegiatanSchema>;

interface NonKegiatanFormProps {
  onSuccess: () => void;
}

export const NonKegiatanForm = ({ onSuccess }: NonKegiatanFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pokList, setPokList] = useState<any[]>([]);
  const [nonKegiatanList, setNonKegiatanList] = useState<any[]>([]);

  const [selectedNonKegiatan, setSelectedNonKegiatan] = useState<string>("");
  const [selectedPok, setSelectedPok] = useState<string>("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<NonKegiatanFormData>({
    resolver: zodResolver(nonKegiatanSchema),
  });

  useEffect(() => {
    fetchPokList();
    fetchNonKegiatanList();
  }, []);

  const fetchPokList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("pok")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setPokList(data);
  };

  const fetchNonKegiatanList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await (supabase as any)
      .from("non_kegiatan")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setNonKegiatanList(data);
  };

  const onSubmit = async (data: NonKegiatanFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase as any).from("non_kegiatan").insert({
        user_id: user.id,
        nama_non_giat: data.nama_non_giat,
        jenis_non_giat: data.jenis_non_giat,
        id_non_giat_sblm: selectedNonKegiatan || null,
        id_pok: selectedPok || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Non-activity created successfully" });
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
        <Label htmlFor="nama_non_giat">Nama Non Kegiatan</Label>
        <Input id="nama_non_giat" {...register("nama_non_giat")} placeholder="Enter non-activity name" />
        {errors.nama_non_giat && <p className="text-sm text-destructive">{errors.nama_non_giat.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenis_non_giat">Jenis Non Kegiatan</Label>
        <Input id="jenis_non_giat" {...register("jenis_non_giat")} placeholder="Enter type" />
        {errors.jenis_non_giat && <p className="text-sm text-destructive">{errors.jenis_non_giat.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_non_giat_sblm">Non Kegiatan Sebelumnya (optional)</Label>
        <Select value={selectedNonKegiatan} onValueChange={(value) => {
          setSelectedNonKegiatan(value);
          setValue("id_non_giat_sblm", value);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select previous non-activity" />
          </SelectTrigger>
          <SelectContent>
            {nonKegiatanList.map((nonKegiatan) => (
              <SelectItem key={nonKegiatan.id} value={nonKegiatan.id}>
                {nonKegiatan.nama_non_giat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_pok">POK (optional)</Label>
        <Select value={selectedPok} onValueChange={(value) => {
          setSelectedPok(value);
          setValue("id_pok", value);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select POK" />
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Non-Activity"}
      </Button>
    </form>
  );
};
