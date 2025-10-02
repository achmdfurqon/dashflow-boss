import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const evidenSchema = z.object({
  id_ref_eviden: z.string().min(1, "Evidence type is required"),
  file_eviden: z.string().optional(),
  deskripsi: z.string().optional(),
  id_giat: z.string().optional(),
  id_non_giat: z.string().optional(),
});

type EvidenFormData = z.infer<typeof evidenSchema>;

interface EvidenFormProps {
  onSuccess: () => void;
}

export const EvidenForm = ({ onSuccess }: EvidenFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [nonKegiatanList, setNonKegiatanList] = useState<any[]>([]);
  const [refEvidenList, setRefEvidenList] = useState<any[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EvidenFormData>({
    resolver: zodResolver(evidenSchema),
  });

  useEffect(() => {
    fetchKegiatanList();
    fetchNonKegiatanList();
    fetchRefEvidenList();
  }, []);

  const fetchKegiatanList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("kegiatan")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setKegiatanList(data);
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

  const fetchRefEvidenList = async () => {
    const { data } = await (supabase as any)
      .from("ref_eviden")
      .select("*");
    
    if (data) setRefEvidenList(data);
  };

  const onSubmit = async (data: EvidenFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase as any).from("eviden").insert({
        user_id: user.id,
        id_ref_eviden: data.id_ref_eviden,
        file_eviden: data.file_eviden || null,
        deskripsi: data.deskripsi || null,
        id_giat: data.id_giat || null,
        id_non_giat: data.id_non_giat || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Evidence created successfully" });
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
        <Label htmlFor="id_ref_eviden">Jenis Eviden</Label>
        <Select onValueChange={(value) => setValue("id_ref_eviden", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select evidence type" />
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
        <Label htmlFor="file_eviden">File Eviden URL (optional)</Label>
        <Input id="file_eviden" {...register("file_eviden")} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi (optional)</Label>
        <Textarea id="deskripsi" {...register("deskripsi")} placeholder="Enter description" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_giat">Kegiatan (optional)</Label>
        <Select onValueChange={(value) => setValue("id_giat", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity" />
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
        <Label htmlFor="id_non_giat">Non Kegiatan (optional)</Label>
        <Select onValueChange={(value) => setValue("id_non_giat", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select non-activity" />
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Evidence"}
      </Button>
    </form>
  );
};
