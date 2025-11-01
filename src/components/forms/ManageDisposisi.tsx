import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Disposisi {
  id: string;
  nama_disposisi: string;
}

interface ManageDisposisiProps {
  onUpdate: () => void;
}

export const ManageDisposisi = ({ onUpdate }: ManageDisposisiProps) => {
  const { toast } = useToast();
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>([]);
  const [newDisposisi, setNewDisposisi] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDisposisi();
  }, []);

  const fetchDisposisi = async () => {
    const { data } = await supabase.from("ref_disposisi").select("*");
    if (data) setDisposisiList(data);
  };

  const handleAdd = async () => {
    if (!newDisposisi.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("ref_disposisi").insert({ nama_disposisi: newDisposisi.trim() });
      
      if (error) throw error;
      
      toast({ title: "Berhasil", description: "Disposisi berhasil ditambahkan" });
      setNewDisposisi("");
      fetchDisposisi();
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
        .from("ref_disposisi")
        .update({ nama_disposisi: editValue.trim() })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({ title: "Berhasil", description: "Disposisi berhasil diubah" });
      setEditingId(null);
      setEditValue("");
      fetchDisposisi();
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
      const { error } = await supabase.from("ref_disposisi").delete().eq("id", id);
      
      if (error) throw error;
      
      toast({ title: "Berhasil", description: "Disposisi berhasil dihapus" });
      fetchDisposisi();
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
          placeholder="Tambah disposisi baru..."
          value={newDisposisi}
          onChange={(e) => setNewDisposisi(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={loading || !newDisposisi.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {disposisiList.map((item) => (
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
                  <span>{item.nama_disposisi}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.nama_disposisi);
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
