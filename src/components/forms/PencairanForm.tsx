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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarIcon, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const pencairanSchema = z.object({
  id_pok: z.string().min(1, "POK is required"),
  nilai_pencairan: z.string().min(1, "Amount is required"),
  riil_pencairan: z.string().optional(),
  metode_pencairan: z.enum(["UP", "TUP", "LS", "Transfer"], {
    errorMap: () => ({ message: "Pilih metode pencairan" }),
  }),
  status_pencairan: z.enum(["SPP", "SP2D"], {
    errorMap: () => ({ message: "Pilih status pencairan" }),
  }),
  tgl_spp: z.date().optional(),
  tgl_sp2d: z.date().optional(),
});

type PencairanFormData = z.infer<typeof pencairanSchema>;

interface PencairanFormProps {
  onSuccess: () => void;
}

export const PencairanForm = ({ onSuccess }: PencairanFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tglSpp, setTglSpp] = useState<Date | undefined>();
  const [tglSp2d, setTglSp2d] = useState<Date | undefined>();
  const [pokList, setPokList] = useState<any[]>([]);
  const [statusPencairan, setStatusPencairan] = useState<string>("SPP");
  const [metodePencairan, setMetodePencairan] = useState<string>("UP");
  const [showRiilPencairan, setShowRiilPencairan] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PencairanFormData>({
    resolver: zodResolver(pencairanSchema),
    defaultValues: {
      status_pencairan: "SPP",
      metode_pencairan: "UP",
    },
  });

  useEffect(() => {
    fetchPOKList();
  }, []);

  const fetchPOKList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get the maximum version first
    const { data: maxVersionData } = await supabase
      .from("pok")
      .select("versi")
      .eq("user_id", user.id)
      .order("versi", { ascending: false })
      .limit(1);

    const maxVersion = maxVersionData?.[0]?.versi || 1;

    // Fetch only POK items with the latest version
    const { data } = await supabase
      .from("pok")
      .select("*")
      .eq("user_id", user.id)
      .eq("versi", maxVersion);
    
    if (data) setPokList(data);
  };

  const onSubmit = async (data: PencairanFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const insertData: any = {
        user_id: user.id,
        id_pok: data.id_pok,
        nilai_pencairan: parseFloat(data.nilai_pencairan),
        metode_pencairan: data.metode_pencairan,
        status_pencairan: data.status_pencairan,
      };

      if (data.riil_pencairan) {
        insertData.riil_pencairan = parseFloat(data.riil_pencairan);
      }

      if (tglSpp) {
        insertData.tgl_spp = format(tglSpp, "yyyy-MM-dd");
      }

      if (tglSp2d) {
        insertData.tgl_sp2d = format(tglSp2d, "yyyy-MM-dd");
      }

      // Set tgl_pencairan based on status
      if (data.status_pencairan === "SPP" && tglSpp) {
        insertData.tgl_pencairan = format(tglSpp, "yyyy-MM-dd");
      } else if (data.status_pencairan === "SP2D" && tglSp2d) {
        insertData.tgl_pencairan = format(tglSp2d, "yyyy-MM-dd");
      }

      const { error } = await (supabase as any).from("pencairan").insert(insertData);

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
        <div className="flex items-center gap-2">
          <Label htmlFor="nilai_pencairan">Nilai Pencairan</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowRiilPencairan(!showRiilPencairan)}
          >
            {showRiilPencairan ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        <Input id="nilai_pencairan" type="number" step="0.01" {...register("nilai_pencairan")} placeholder="0.00" />
        {errors.nilai_pencairan && <p className="text-sm text-destructive">{errors.nilai_pencairan.message}</p>}
        
        <Collapsible open={showRiilPencairan}>
          <CollapsibleContent className="space-y-2 pt-2">
            <Label htmlFor="riil_pencairan">Riil Pencairan</Label>
            <Input id="riil_pencairan" type="number" step="0.01" {...register("riil_pencairan")} placeholder="0.00" />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metode_pencairan">Metode Pencairan</Label>
        <Select value={metodePencairan} onValueChange={(value) => {
          setMetodePencairan(value);
          setValue("metode_pencairan", value as any);
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UP">UP</SelectItem>
            <SelectItem value="TUP">TUP</SelectItem>
            <SelectItem value="LS">LS</SelectItem>
            <SelectItem value="Transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        {errors.metode_pencairan && <p className="text-sm text-destructive">{errors.metode_pencairan.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status_pencairan">Status Pencairan</Label>
        <Select value={statusPencairan} onValueChange={(value) => {
          setStatusPencairan(value);
          setValue("status_pencairan", value as any);
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SPP">SPP</SelectItem>
            <SelectItem value="SP2D">SP2D</SelectItem>
          </SelectContent>
        </Select>
        {errors.status_pencairan && <p className="text-sm text-destructive">{errors.status_pencairan.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tanggal SPP</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {tglSpp ? format(tglSpp, "PPP") : "Pilih tanggal SPP"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={tglSpp} onSelect={(date) => {
              if (date) {
                setTglSpp(date);
                setValue("tgl_spp", date);
              }
            }} initialFocus className="pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Tanggal SP2D</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {tglSp2d ? format(tglSp2d, "PPP") : "Pilih tanggal SP2D"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={tglSp2d} onSelect={(date) => {
              if (date) {
                setTglSp2d(date);
                setValue("tgl_sp2d", date);
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
