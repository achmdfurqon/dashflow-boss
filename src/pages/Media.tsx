import { useState, useEffect } from "react";
import { Plus, Search, Image as ImageIcon, FileVideo, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaForm } from "@/components/forms/MediaForm";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

export default function Media() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("media")
      .select("*, kegiatan(*)")
      .eq("user_id", user.id)
      .order("upload_date", { ascending: false });

    if (data) setMediaItems(data);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchMediaItems();
  };

  const filteredMedia = mediaItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <FileVideo className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Foto & Materi</h1>
          <p className="text-muted-foreground">Kelola foto dokumentasi dan materi kegiatan</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Media</DialogTitle>
            </DialogHeader>
            <MediaForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedia.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getMediaIcon(item.file_type)}
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
              <Badge variant="secondary">{item.file_type}</Badge>
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

        {filteredMedia.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada media ditemukan
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
