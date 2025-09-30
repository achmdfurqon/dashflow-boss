import { useState, useEffect } from "react";
import { Plus, Search, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EvidenForm } from "@/components/forms/EvidenForm";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

export default function Eviden() {
  const [searchQuery, setSearchQuery] = useState("");
  const [evidenItems, setEvidenItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvidenItems();
  }, []);

  const fetchEvidenItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("eviden")
      .select("*, kegiatan(*)")
      .eq("user_id", user.id)
      .order("upload_date", { ascending: false });

    if (data) setEvidenItems(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchEvidenItems();
  };

  const filteredEviden = evidenItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-5 w-5" />;
      case "invoice":
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Eviden</h1>
          <p className="text-muted-foreground">Kelola dokumen dan bukti kegiatan</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Dokumen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Dokumen Eviden</DialogTitle>
            </DialogHeader>
            <EvidenForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEviden.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getDocIcon(item.document_type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(item.upload_date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary">{item.document_type}</Badge>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              )}
              {item.kegiatan && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Related Activity</p>
                  <p className="text-sm font-medium">{item.kegiatan.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredEviden.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada dokumen eviden ditemukan
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
