import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PencairanForm } from "@/components/forms/PencairanForm";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

export default function Pencairan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pencairanItems, setPencairanItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPencairanItems();
  }, []);

  const fetchPencairanItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("pencairan")
      .select("*, pok(*)")
      .eq("user_id", user.id)
      .order("tgl_pencairan", { ascending: false });

    if (data) setPencairanItems(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchPencairanItems();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const filteredPencairan = pencairanItems.filter((item) =>
    item.metode_pencairan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatCurrency(Number(item.nilai_pencairan)).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pencairan</h1>
          <p className="text-muted-foreground">Manajemen pencairan dana kegiatan</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Permintaan Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Permintaan Pencairan</DialogTitle>
            </DialogHeader>
            <PencairanForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan metode atau nilai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPencairan.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{item.metode_pencairan}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(item.tgl_pencairan), "dd MMMM yyyy")}
                  </p>
                </div>
                <Badge variant={getStatusVariant(item.status_pencairan)}>{item.status_pencairan}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nilai Pencairan</p>
                  <p className="font-medium text-lg">{formatCurrency(Number(item.nilai_pencairan))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">POK</p>
                  <p className="font-medium">
                    {item.pok ? `${item.pok.kode_akun} - ${item.pok.nama_akun}` : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPencairan.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada pencairan ditemukan
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
