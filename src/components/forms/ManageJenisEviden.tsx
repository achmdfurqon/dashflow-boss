import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JenisEviden {
  id: string;
  jenis_eviden: string;
}

interface ManageJenisEvidenProps {
  onUpdate: () => void;
}

export const ManageJenisEviden = ({ onUpdate }: ManageJenisEvidenProps) => {
  const { toast } = useToast();
  const [jenisEvidenList, setJenisEvidenList] = useState<JenisEviden[]>([]);
  const [newJenis, setNewJenis] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJenisEviden();
  }, []);

  const fetchJenisEviden = async () => {
    const { data } = await supabase.from("ref_eviden").select("*");
    if (data) setJenisEvidenList(data);
  };

  const handleAdd = async () => {
    if (!newJenis.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("ref_eviden").insert({ jenis_eviden: newJenis.trim() });
      
      if (error) throw error;
      
      toast({ title: "Berhasil", description: "Jenis eviden berhasil ditambahkan" });
      setNewJenis("");
      fetchJenisEviden();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ref_eviden")
        .update({ jenis_eviden: editValue.trim() })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({ title: "Berhasil", description: "Jenis eviden berhasil diubah" });
      setEditingId(null);
      setEditValue("");
      fetchJenisEviden();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("ref_eviden").delete().eq("id", id);
      
      if (error) throw error;
      
      toast({ title: "Berhasil", description: "Jenis eviden berhasil dihapus" });
      fetchJenisEviden();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Tambah jenis eviden baru..."
          value={newJenis}
          onChange={(e) => setNewJenis(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={loading || !newJenis.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {jenisEvidenList.map((item) => (
          <Card key={item.id}>
            <CardContent className="py-3 px-4">
              {editingId === item.id ? (
                <div className="flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleEdit(item.id)}
                  />
                  <Button size="sm" onClick={() => handleEdit(item.id)} disabled={loading}>
                    Simpan
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditingId(null);
                      setEditValue("");
                    }}
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{item.jenis_eviden}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.jenis_eviden);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};