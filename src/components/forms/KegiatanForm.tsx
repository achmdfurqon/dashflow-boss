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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const kegiatanSchema = z.object({
  jenis_giat: z.string().min(1, "Activity type is required"),
  nama: z.string().min(1, "Activity name is required"),
  waktu_mulai: z.date(),
  waktu_selesai: z.date(),
  jenis_lokasi: z.enum(["kantor", "hotel", "virtual"]),
  tempat: z.string().min(1, "Location is required"),
  agenda: z.string().optional(),
  penyelenggara: z.string().min(1, "Organizer is required"),
  no_surat: z.string().optional(),
  tgl_surat: z.date().optional(),
  file_surat: z.string().optional(),
  disposisi: z.string().optional(),
  file_laporan: z.string().optional(),
  id_giat_sblm: z.string().optional(),
  id_pok: z.string().optional(),
});

type KegiatanFormData = z.infer<typeof kegiatanSchema>;

interface KegiatanFormProps {
  onSuccess: () => void;
}

export const KegiatanForm = ({ onSuccess }: KegiatanFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [suratDate, setSuratDate] = useState<Date>();
  const [jenisLokasi, setJenisLokasi] = useState<string>("kantor");
  const [pokList, setPokList] = useState<any[]>([]);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<KegiatanFormData>({
    resolver: zodResolver(kegiatanSchema),
  });

  useEffect(() => {
    fetchPokList();
    fetchKegiatanList();
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

  const fetchKegiatanList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("kegiatan")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setKegiatanList(data);
  };

  const onSubmit = async (data: KegiatanFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase as any).from("kegiatan").insert({
        user_id: user.id,
        jenis_giat: data.jenis_giat,
        nama: data.nama,
        waktu_mulai: startDate!.toISOString(),
        waktu_selesai: endDate!.toISOString(),
        jenis_lokasi: data.jenis_lokasi,
        tempat: data.tempat,
        agenda: data.agenda || null,
        penyelenggara: data.penyelenggara,
        no_surat: data.no_surat || null,
        tgl_surat: suratDate ? format(suratDate, "yyyy-MM-dd") : null,
        file_surat: data.file_surat || null,
        disposisi: data.disposisi || null,
        file_laporan: data.file_laporan || null,
        id_giat_sblm: data.id_giat_sblm || null,
        id_pok: data.id_pok || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Activity created successfully" });
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
        <Label htmlFor="jenis_giat">Jenis Kegiatan</Label>
        <Input id="jenis_giat" {...register("jenis_giat")} placeholder="e.g., Internal, Eksternal" />
        {errors.jenis_giat && <p className="text-sm text-destructive">{errors.jenis_giat.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama">Nama Kegiatan</Label>
        <Input id="nama" {...register("nama")} placeholder="Enter activity name" />
        {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Waktu Mulai</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={(date) => {
                setStartDate(date);
                if (date) setValue("waktu_mulai", date);
              }} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Waktu Selesai</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={(date) => {
                setEndDate(date);
                if (date) setValue("waktu_selesai", date);
              }} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenis_lokasi">Jenis Lokasi</Label>
        <Select value={jenisLokasi} onValueChange={(value) => {
          setJenisLokasi(value);
          setValue("jenis_lokasi", value as any);
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kantor">Kantor</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="virtual">Virtual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tempat">Tempat</Label>
        <Input id="tempat" {...register("tempat")} placeholder="Enter location" />
        {errors.tempat && <p className="text-sm text-destructive">{errors.tempat.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agenda">Agenda (optional)</Label>
        <Textarea id="agenda" {...register("agenda")} placeholder="Enter agenda" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="penyelenggara">Penyelenggara</Label>
        <Input id="penyelenggara" {...register("penyelenggara")} placeholder="Enter organizer" />
        {errors.penyelenggara && <p className="text-sm text-destructive">{errors.penyelenggara.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="no_surat">No Surat (optional)</Label>
        <Input id="no_surat" {...register("no_surat")} placeholder="Enter letter number" />
      </div>

      <div className="space-y-2">
        <Label>Tanggal Surat (optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !suratDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {suratDate ? format(suratDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={suratDate} onSelect={(date) => {
              setSuratDate(date);
              if (date) setValue("tgl_surat", date);
            }} initialFocus className="pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file_surat">File Surat URL (optional)</Label>
        <Input id="file_surat" {...register("file_surat")} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="disposisi">Disposisi (optional)</Label>
        <Textarea id="disposisi" {...register("disposisi")} placeholder="Enter disposition" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file_laporan">File Laporan URL (optional)</Label>
        <Input id="file_laporan" {...register("file_laporan")} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_giat_sblm">Kegiatan Sebelumnya (optional)</Label>
        <Select onValueChange={(value) => setValue("id_giat_sblm", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select previous activity" />
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
        <Label htmlFor="id_pok">POK (optional)</Label>
        <Select onValueChange={(value) => setValue("id_pok", value)}>
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
        {loading ? "Creating..." : "Create Activity"}
      </Button>
    </form>
  );
};
