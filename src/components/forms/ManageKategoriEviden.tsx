import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KategoriEviden {
  id: string;
  kategori_eviden: string;
}

interface ManageKategoriEvidenProps {
  onUpdate?: () => void;
}

const ManageKategoriEviden = ({ onUpdate }: ManageKategoriEvidenProps) => {
  const [kategoriEvidenList, setKategoriEvidenList] = useState<KategoriEviden[]>([]);
  const [newKategori, setNewKategori] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchKategoriEviden = async () => {
    try {
      const { data, error } = await supabase
        .from("ref_kategori_eviden")
        .select("*")
        .order("kategori_eviden");

      if (error) throw error;
      setKategoriEvidenList(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchKategoriEviden();
  }, []);

  const handleAdd = async () => {
    if (!newKategori.trim()) {
      toast({
        title: "Error",
        description: "Kategori eviden tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ref_kategori_eviden")
        .insert([{ kategori_eviden: newKategori.trim() }]);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Kategori eviden berhasil ditambahkan",
      });
      setNewKategori("");
      fetchKategoriEviden();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) {
      toast({
        title: "Error",
        description: "Kategori eviden tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ref_kategori_eviden")
        .update({ kategori_eviden: editValue.trim() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Kategori eviden berhasil diperbarui",
      });
      setEditingId(null);
      setEditValue("");
      fetchKategoriEviden();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori eviden ini?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ref_kategori_eviden")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Kategori eviden berhasil dihapus",
      });
      fetchKategoriEviden();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Kategori eviden baru..."
          value={newKategori}
          onChange={(e) => setNewKategori(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={loading}>
          Tambah
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {kategoriEvidenList.map((item) => (
            <Card key={item.id} className="p-3">
              {editingId === item.id ? (
                <div className="flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleEdit(item.id)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(item.id)}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setEditValue("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>{item.kategori_eviden}</span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.kategori_eviden);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ManageKategoriEviden;