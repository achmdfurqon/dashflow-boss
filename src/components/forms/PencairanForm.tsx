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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const pencairanSchema = z.object({
  id_pok: z.string().min(1, "POK is required"),
  nilai_pencairan: z.string().min(1, "Amount is required"),
  metode_pencairan: z.string().min(1, "Payment method is required"),
  status_pencairan: z.enum(["pending", "approved", "rejected"]),
  tgl_pencairan: z.date(),
});

type PencairanFormData = z.infer<typeof pencairanSchema>;

interface PencairanFormProps {
  onSuccess: () => void;
}

export const PencairanForm = ({ onSuccess }: PencairanFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tglPencairan, setTglPencairan] = useState<Date>(new Date());
  const [pokList, setPokList] = useState<any[]>([]);
  const [statusPencairan, setStatusPencairan] = useState<string>("pending");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PencairanFormData>({
    resolver: zodResolver(pencairanSchema),
    defaultValues: {
      status_pencairan: "pending",
    },
  });

  useEffect(() => {
    fetchPOKList();
  }, []);

  const fetchPOKList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("pok")
      .select("*")
      .eq("user_id", user.id);
    
    if (data) setPokList(data);
  };

  const onSubmit = async (data: PencairanFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase as any).from("pencairan").insert({
        user_id: user.id,
        id_pok: data.id_pok,
        nilai_pencairan: parseFloat(data.nilai_pencairan),
        metode_pencairan: data.metode_pencairan,
        status_pencairan: data.status_pencairan,
        tgl_pencairan: format(tglPencairan, "yyyy-MM-dd"),
      });

      if (error) throw error;

      toast({ title: "Success", description: "Disbursement created successfully" });
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
        <Label htmlFor="id_pok">POK</Label>
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
        {errors.id_pok && <p className="text-sm text-destructive">{errors.id_pok.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nilai_pencairan">Nilai Pencairan</Label>
        <Input id="nilai_pencairan" type="number" step="0.01" {...register("nilai_pencairan")} placeholder="0.00" />
        {errors.nilai_pencairan && <p className="text-sm text-destructive">{errors.nilai_pencairan.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="metode_pencairan">Metode Pencairan</Label>
        <Input id="metode_pencairan" {...register("metode_pencairan")} placeholder="e.g., Transfer, Tunai" />
        {errors.metode_pencairan && <p className="text-sm text-destructive">{errors.metode_pencairan.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status_pencairan">Status</Label>
        <Select value={statusPencairan} onValueChange={(value) => {
          setStatusPencairan(value);
          setValue("status_pencairan", value as any);
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tanggal Pencairan</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {tglPencairan ? format(tglPencairan, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={tglPencairan} onSelect={(date) => {
              if (date) {
                setTglPencairan(date);
                setValue("tgl_pencairan", date);
              }
            }} initialFocus className="pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Disbursement"}
      </Button>
    </form>
  );
};
