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
      .order("request_date", { ascending: false });

    if (data) setPencairanItems(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchPencairanItems();
  };

  const filteredPencairan = pencairanItems.filter((item) =>
    item.request_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

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
              placeholder="Cari berdasarkan nomor permintaan..."
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
                  <CardTitle>{item.request_number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(item.request_date), "MMMM dd, yyyy")}
                  </p>
                </div>
                <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(Number(item.amount))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">POK</p>
                  <p className="font-medium">{item.pok?.code || "N/A"}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-muted-foreground text-sm">Purpose</p>
                <p className="text-sm">{item.purpose}</p>
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
