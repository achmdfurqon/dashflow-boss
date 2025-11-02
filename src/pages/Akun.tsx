import { useState, useEffect } from "react";
import { Search, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type UserRole = "admin" | "staf_keuangan" | "staf_biasa";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  staf_keuangan: "Staf Keuangan",
  staf_biasa: "Staf Biasa",
};

const roleVariants: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  staf_keuangan: "secondary",
  staf_biasa: "outline",
};

export default function Akun() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("staf_biasa");

  useEffect(() => {
    // Check if user has admin role
    if (userRole && userRole !== "admin") {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki akses ke halaman ini",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    if (userRole === "admin") {
      fetchUsers();
    }
  }, [userRole, navigate]);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .single();

          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: (roleData?.role as UserRole) || "staf_biasa",
          };
        })
      );

      setUsers(usersWithRoles);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    try {
      // Delete existing role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: selectedUser.id,
          role: newRole,
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Role berhasil diubah",
      });

      setDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Akun</h1>
          <p className="text-muted-foreground">Kelola pengguna dan role akses</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.full_name || user.email}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={roleVariants[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                  <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                    if (!open) {
                      setSelectedUser(null);
                    }
                    setDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setDialogOpen(true);
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Ubah Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ubah Role Pengguna</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Pengguna</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Role Baru</Label>
                          <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="staf_keuangan">Staf Keuangan</SelectItem>
                              <SelectItem value="staf_biasa">Staf Biasa</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-muted-foreground space-y-1 mt-2">
                            <p><strong>Admin:</strong> Akses ke semua menu</p>
                            <p><strong>Staf Keuangan:</strong> Semua menu kecuali Akun</p>
                            <p><strong>Staf Biasa:</strong> Dashboard, Kegiatan, Eviden saja</p>
                          </div>
                        </div>
                        <Button onClick={handleChangeRole} className="w-full">
                          Simpan Perubahan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tidak ada pengguna ditemukan
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
