import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Program {
  id: string;
  nama_program: string;
}

interface ManageProgramProps {
  onUpdate?: () => void;
}

const ManageProgram = ({ onUpdate }: ManageProgramProps) => {
  const [programList, setProgramList] = useState<Program[]>([]);
  const [newProgram, setNewProgram] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from("ref_program")
        .select("*")
        .order("nama_program");

      if (error) throw error;
      setProgramList(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProgram();
  }, []);

  const handleAdd = async () => {
    if (!newProgram.trim()) {
      toast({
        title: "Error",
        description: "Nama program tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ref_program")
        .insert([{ nama_program: newProgram.trim() }]);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Program berhasil ditambahkan",
      });
      setNewProgram("");
      fetchProgram();
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
        description: "Nama program tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ref_program")
        .update({ nama_program: editValue.trim() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Program berhasil diperbarui",
      });
      setEditingId(null);
      setEditValue("");
      fetchProgram();
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
    if (!confirm("Yakin ingin menghapus program ini?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ref_program")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Program berhasil dihapus",
      });
      fetchProgram();
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
          placeholder="Nama program baru..."
          value={newProgram}
          onChange={(e) => setNewProgram(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={loading}>
          Tambah
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {programList.map((item) => (
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
                  <span>{item.nama_program}</span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.nama_program);
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

export default ManageProgram;