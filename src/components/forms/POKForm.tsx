import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const pokSchema = z.object({
  code: z.string().min(1, "Code is required"),
  description: z.string().min(1, "Description is required"),
  budget_amount: z.string().min(1, "Budget amount is required"),
});

type POKFormData = z.infer<typeof pokSchema>;

interface POKFormProps {
  onSuccess: () => void;
}

export const POKForm = ({ onSuccess }: POKFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<POKFormData>({
    resolver: zodResolver(pokSchema),
  });

  const onSubmit = async (data: POKFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("pok").insert({
        user_id: user.id,
        code: data.code,
        description: data.description,
        budget_amount: parseFloat(data.budget_amount),
        used_amount: 0,
        status: "active",
      });

      if (error) throw error;

      toast({ title: "Success", description: "POK created successfully" });
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
        <Label htmlFor="code">POK Code</Label>
        <Input id="code" {...register("code")} placeholder="e.g., 5211" />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} placeholder="Enter POK description" />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_amount">Budget Amount</Label>
        <Input id="budget_amount" type="number" step="0.01" {...register("budget_amount")} placeholder="0.00" />
        {errors.budget_amount && <p className="text-sm text-destructive">{errors.budget_amount.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create POK"}
      </Button>
    </form>
  );
};
