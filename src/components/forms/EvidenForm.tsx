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
  kegiatan_id: z.string().min(1, "Activity is required"),
  document_type: z.enum(["proposal", "report", "invoice", "photo", "other"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file_url: z.string().optional(),
});

type EvidenFormData = z.infer<typeof evidenSchema>;

interface EvidenFormProps {
  onSuccess: () => void;
}

export const EvidenForm = ({ onSuccess }: EvidenFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState<string>("");
  const [docType, setDocType] = useState<string>("report");

  const { register, handleSubmit, formState: { errors } } = useForm<EvidenFormData>({
    resolver: zodResolver(evidenSchema),
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

  const onSubmit = async (data: EvidenFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("eviden").insert({
        user_id: user.id,
        kegiatan_id: data.kegiatan_id,
        document_type: data.document_type,
        title: data.title,
        description: data.description || null,
        file_url: data.file_url || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Evidence document created successfully" });
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
        <Label htmlFor="kegiatan_id">Activity</Label>
        <Select value={selectedKegiatan} onValueChange={setSelectedKegiatan} {...register("kegiatan_id")}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            {kegiatanList.map((kegiatan) => (
              <SelectItem key={kegiatan.id} value={kegiatan.id}>
                {kegiatan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.kegiatan_id && <p className="text-sm text-destructive">{errors.kegiatan_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="document_type">Document Type</Label>
        <Select value={docType} onValueChange={setDocType} {...register("document_type")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Document title" />
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
        {loading ? "Creating..." : "Create Evidence Document"}
      </Button>
    </form>
  );
};
