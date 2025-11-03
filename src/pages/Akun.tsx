import { useState, useEffect } from "react";
import { Search, UserPlus, Shield, Trash2 } from "lucide-react";
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
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("staf_biasa");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);

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

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserRole) {
      toast({
        title: "Error",
        description: "Email, password, dan role harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: newUserEmail,
            password: newUserPassword,
            full_name: newUserFullName || newUserEmail,
            role: newUserRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat user');
      }

      toast({
        title: "Berhasil",
        description: "User baru berhasil dibuat",
      });

      setAddUserDialogOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserRole("staf_biasa");
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userToDelete.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus user');
      }

      toast({
        title: "Berhasil",
        description: "User berhasil dihapus",
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);
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
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap (Opsional)</Label>
                <Input
                  type="text"
                  placeholder="Nama lengkap"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole)}>
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
              <Button onClick={handleCreateUser} className="w-full" disabled={isCreatingUser}>
                {isCreatingUser ? "Membuat User..." : "Buat User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setUserToDelete(user);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Apakah Anda yakin ingin menghapus user <strong>{userToDelete?.email}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Tindakan ini tidak dapat dibatalkan. Semua data yang terkait dengan user ini akan dihapus.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Hapus User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
