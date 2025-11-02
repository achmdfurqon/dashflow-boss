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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ManageDisposisi } from "./ManageDisposisi";

const kegiatanSchema = z.object({
  jenis_giat: z.enum(["Internal", "Eksternal"], { required_error: "Jenis kegiatan harus dipilih" }),
  nama: z.string().min(1, "Activity name is required"),
  waktu_mulai: z.date().optional(),
  waktu_selesai: z.date().optional(),
  jenis_lokasi: z.enum(["kantor", "hotel", "virtual"]),
  tempat: z.string().min(1, "Location is required"),
  agenda: z.string().optional(),
  penyelenggara: z.string().min(1, "Organizer is required"),
  no_surat: z.string().optional(),
  tgl_surat: z.date().optional(),
  disposisi: z.array(z.string()).optional(),
  id_giat_sblm: z.string().optional(),
  id_pok: z.string().optional(),
});

type KegiatanFormData = z.infer<typeof kegiatanSchema>;

interface KegiatanFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export const KegiatanForm = ({ onSuccess, initialData }: KegiatanFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [suratDate, setSuratDate] = useState<Date>();
  const [jenisLokasi, setJenisLokasi] = useState<string>("kantor");
  const [jenisGiat, setJenisGiat] = useState<string>("");
  const [pokList, setPokList] = useState<any[]>([]);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [disposisiList, setDisposisiList] = useState<any[]>([]);
  const [selectedDisposisi, setSelectedDisposisi] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<KegiatanFormData>({
    resolver: zodResolver(kegiatanSchema),
    defaultValues: {
      jenis_lokasi: "kantor"
    }
  });

  useEffect(() => {
    fetchPokList();
    fetchKegiatanList();
    fetchDisposisiList();
    
    if (initialData) {
      setValue("jenis_giat", initialData.jenis_giat);
      setValue("nama", initialData.nama);
      setValue("jenis_lokasi", initialData.jenis_lokasi);
      setValue("tempat", initialData.tempat);
      setValue("agenda", initialData.agenda);
      setValue("penyelenggara", initialData.penyelenggara);
      setValue("no_surat", initialData.no_surat);
      setValue("id_giat_sblm", initialData.id_giat_sblm);
      setValue("id_pok", initialData.id_pok);
      
      setJenisGiat(initialData.jenis_giat);
      setJenisLokasi(initialData.jenis_lokasi);
      
      if (initialData.waktu_mulai) {
        const start = new Date(initialData.waktu_mulai);
        setStartDate(start);
        setStartTime(`${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`);
      }
      
      if (initialData.waktu_selesai) {
        const end = new Date(initialData.waktu_selesai);
        setEndDate(end);
        setEndTime(`${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`);
      }
      
      if (initialData.tgl_surat) {
        setSuratDate(new Date(initialData.tgl_surat));
      }
      
      if (initialData.disposisi) {
        setSelectedDisposisi(initialData.disposisi);
      }
    }
  }, [initialData]);

  const fetchDisposisiList = async () => {
    const { data } = await supabase.from("ref_disposisi").select("*");
    if (data) setDisposisiList(data);
  };

  const fetchPokList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get latest version for each POK
    const { data } = await supabase
      .from("pok")
      .select("*")
      .eq("user_id", user.id)
      .order("tanggal_versi", { ascending: false });
    
    if (data) {
      // Group by kode_akun and get only the latest version
      const latestPokMap = new Map();
      data.forEach(pok => {
        const existing = latestPokMap.get(pok.kode_akun);
        if (!existing || pok.versi > existing.versi) {
          latestPokMap.set(pok.kode_akun, pok);
        }
      });
      setPokList(Array.from(latestPokMap.values()));
    }
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
    if (!startDate || !endDate) {
      toast({ 
        title: "Error", 
        description: "Please select start and end dates", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Combine date and time
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const waktuMulai = new Date(startDate);
      waktuMulai.setHours(startHour, startMinute, 0, 0);
      
      const waktuSelesai = new Date(endDate);
      waktuSelesai.setHours(endHour, endMinute, 0, 0);

      const payload = {
        jenis_giat: data.jenis_giat,
        nama: data.nama,
        waktu_mulai: waktuMulai.toISOString(),
        waktu_selesai: waktuSelesai.toISOString(),
        jenis_lokasi: data.jenis_lokasi,
        tempat: data.tempat,
        agenda: data.agenda || null,
        penyelenggara: data.penyelenggara,
        no_surat: data.no_surat || null,
        tgl_surat: suratDate ? format(suratDate, "yyyy-MM-dd") : null,
        disposisi: selectedDisposisi.length > 0 ? selectedDisposisi : null,
        id_giat_sblm: data.id_giat_sblm || null,
        id_pok: data.id_pok || null,
      };

      let error;
      if (initialData) {
        const result = await supabase
          .from("kegiatan")
          .update(payload as any)
          .eq("id", initialData.id);
        error = result.error;
      } else {
        const result = await supabase.from("kegiatan").insert(payload as any);
        error = result.error;
      }

      if (error) throw error;

      toast({ 
        title: "Berhasil", 
        description: initialData ? "Kegiatan berhasil diubah" : "Kegiatan berhasil dibuat" 
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
        <Label htmlFor="jenis_giat">Jenis Kegiatan</Label>
        <Select value={jenisGiat} onValueChange={(value) => {
          setJenisGiat(value);
          setValue("jenis_giat", value as any);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis kegiatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Internal">Internal</SelectItem>
            <SelectItem value="Eksternal">Eksternal</SelectItem>
          </SelectContent>
        </Select>
        {errors.jenis_giat && <p className="text-sm text-destructive">{errors.jenis_giat.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama">Nama Kegiatan</Label>
        <Input id="nama" {...register("nama")} placeholder="Enter activity name" />
        {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tanggal Mulai</Label>
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
          <Label>Jam Mulai</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tanggal Selesai</Label>
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

        <div className="space-y-2">
          <Label>Jam Selesai</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full"
          />
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
        <div className="flex justify-between items-center">
          <Label>Disposisi (optional)</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Kelola
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kelola Disposisi</DialogTitle>
              </DialogHeader>
              <ManageDisposisi onUpdate={fetchDisposisiList} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
          {disposisiList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada disposisi. Klik "Kelola" untuk menambahkan.</p>
          ) : (
            disposisiList.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`disposisi-${item.id}`}
                  checked={selectedDisposisi.includes(item.nama_disposisi)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const newSelected = [...selectedDisposisi, item.nama_disposisi];
                      setSelectedDisposisi(newSelected);
                      setValue("disposisi", newSelected);
                    } else {
                      const newSelected = selectedDisposisi.filter((d) => d !== item.nama_disposisi);
                      setSelectedDisposisi(newSelected);
                      setValue("disposisi", newSelected);
                    }
                  }}
                />
                <Label htmlFor={`disposisi-${item.id}`} className="font-normal cursor-pointer">
                  {item.nama_disposisi}
                </Label>
              </div>
            ))
          )}
        </div>
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

      {jenisGiat === "Internal" && (
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
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Activity" : "Create Activity")}
      </Button>
    </form>
  );
};
