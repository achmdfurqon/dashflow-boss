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

const mediaSchema = z.object({
  kegiatan_id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file_url: z.string().optional(),
  file_type: z.enum(["photo", "document", "video"]),
});

type MediaFormData = z.infer<typeof mediaSchema>;

interface MediaFormProps {
  onSuccess: () => void;
}

export const MediaForm = ({ onSuccess }: MediaFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState<string>("");
  const [fileType, setFileType] = useState<string>("photo");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      file_type: "photo",
    },
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

  const onSubmit = async (data: MediaFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("media").insert({
        user_id: user.id,
        kegiatan_id: selectedKegiatan || null,
        title: data.title,
        description: data.description || null,
        file_url: data.file_url || null,
        file_type: fileType as "photo" | "document" | "video",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Media created successfully" });
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
        <Label htmlFor="kegiatan_id">Activity (optional)</Label>
        <Select value={selectedKegiatan} onValueChange={(value) => {
          setSelectedKegiatan(value);
          setValue("kegiatan_id", value);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity (optional)" />
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
        <Label htmlFor="file_type">File Type</Label>
        <Select value={fileType} onValueChange={(value) => {
          setFileType(value);
          setValue("file_type", value as "photo" | "document" | "video");
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Media title" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} placeholder="Optional description" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file_url">File URL (optional)</Label>
        <Input id="file_url" {...register("file_url")} placeholder="https://..." />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Media"}
      </Button>
    </form>
  );
};
