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

const pencairanSchema = z.object({
  pok_id: z.string().min(1, "POK is required"),
  request_number: z.string().min(1, "Request number is required"),
  amount: z.string().min(1, "Amount is required"),
  purpose: z.string().min(1, "Purpose is required"),
});

type PencairanFormData = z.infer<typeof pencairanSchema>;

interface PencairanFormProps {
  onSuccess: () => void;
}

export const PencairanForm = ({ onSuccess }: PencairanFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requestDate, setRequestDate] = useState<Date>(new Date());
  const [pokList, setPokList] = useState<any[]>([]);
  const [selectedPok, setSelectedPok] = useState<string>("");

  const { register, handleSubmit, formState: { errors } } = useForm<PencairanFormData>({
    resolver: zodResolver(pencairanSchema),
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
      .eq("user_id", user.id)
      .eq("status", "active");
    
    if (data) setPokList(data);
  };

  const onSubmit = async (data: PencairanFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("pencairan").insert({
        user_id: user.id,
        pok_id: data.pok_id,
        request_number: data.request_number,
        amount: parseFloat(data.amount),
        request_date: format(requestDate, "yyyy-MM-dd"),
        purpose: data.purpose,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Disbursement request created successfully" });
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
        <Label htmlFor="pok_id">POK</Label>
        <Select value={selectedPok} onValueChange={setSelectedPok} {...register("pok_id")}>
          <SelectTrigger>
            <SelectValue placeholder="Select POK" />
          </SelectTrigger>
          <SelectContent>
            {pokList.map((pok) => (
              <SelectItem key={pok.id} value={pok.id}>
                {pok.code} - {pok.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.pok_id && <p className="text-sm text-destructive">{errors.pok_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="request_number">Request Number</Label>
        <Input id="request_number" {...register("request_number")} placeholder="e.g., REQ-001" />
        {errors.request_number && <p className="text-sm text-destructive">{errors.request_number.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} placeholder="0.00" />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Request Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {requestDate ? format(requestDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={requestDate} onSelect={(date) => date && setRequestDate(date)} initialFocus className="pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea id="purpose" {...register("purpose")} placeholder="Enter purpose of disbursement" />
        {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Disbursement Request"}
      </Button>
    </form>
  );
};
