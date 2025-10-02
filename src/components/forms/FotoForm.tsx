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

const fotoSchema = z.object({
  file_foto: z.string().min(1, "Photo URL is required"),
  id_giat: z.string().optional(),
});

type FotoFormData = z.infer<typeof fotoSchema>;

interface FotoFormProps {
  onSuccess: () => void;
}

export const FotoForm = ({ onSuccess }: FotoFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState<string>("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FotoFormData>({
    resolver: zodResolver(fotoSchema),
  });

  useEffect(() => {
    fetchKegiatanList();
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

  const onSubmit = async (data: FotoFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("foto").insert({
        user_id: user.id,
        file_foto: data.file_foto,
        id_giat: selectedKegiatan || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Photo created successfully" });
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
        <Label htmlFor="file_foto">File Foto URL</Label>
        <Input id="file_foto" {...register("file_foto")} placeholder="https://..." />
        {errors.file_foto && <p className="text-sm text-destructive">{errors.file_foto.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_giat">Activity (optional)</Label>
        <Select value={selectedKegiatan} onValueChange={(value) => {
          setSelectedKegiatan(value);
          setValue("id_giat", value);
        }}>
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Upload Photo"}
      </Button>
    </form>
  );
};
