import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UserRole = "admin" | "staf_keuangan" | "staf_biasa";

interface Permission {
  id: string;
  role: UserRole;
  menu_key: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "kegiatan", label: "Kegiatan" },
  { key: "pok", label: "POK" },
  { key: "pencairan", label: "Pencairan" },
  { key: "eviden", label: "Eviden" },
  { key: "akun", label: "Akun" },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  staf_keuangan: "Staf Keuangan",
  staf_biasa: "Staf Biasa",
};

export function PermissionsManager() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_permissions")
      .select("*")
      .order("role", { ascending: true })
      .order("menu_key", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat permissions",
        variant: "destructive",
      });
    } else if (data) {
      setPermissions(data);
    }
    setLoading(false);
  };

  const updatePermission = async (
    permissionId: string,
    field: keyof Permission,
    value: boolean
  ) => {
    const { error } = await supabase
      .from("menu_permissions")
      .update({ [field]: value })
      .eq("id", permissionId);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui permission",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Permission berhasil diperbarui",
      });
      fetchPermissions();
    }
  };

  const rolePermissions = permissions.filter((p) => p.role === selectedRole);

  if (loading) {
    return <div className="text-center py-8">Memuat permissions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Permissions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Atur hak akses untuk setiap role dan menu secara dinamis
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="staf_keuangan">Staf Keuangan</TabsTrigger>
            <TabsTrigger value="staf_biasa">Staf Biasa</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedRole} className="space-y-4 mt-4">
            <div className="mb-4">
              <Badge variant="outline" className="text-base px-3 py-1">
                {roleLabels[selectedRole]}
              </Badge>
            </div>

            {menuItems.map((menu) => {
              const permission = rolePermissions.find((p) => p.menu_key === menu.key);
              
              if (!permission) return null;

              return (
                <Card key={menu.key} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{menu.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${menu.key}-view`}
                          checked={permission.can_view}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.id, "can_view", checked)
                          }
                        />
                        <Label htmlFor={`${menu.key}-view`} className="cursor-pointer">
                          Lihat
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${menu.key}-create`}
                          checked={permission.can_create}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.id, "can_create", checked)
                          }
                          disabled={!permission.can_view}
                        />
                        <Label 
                          htmlFor={`${menu.key}-create`} 
                          className={permission.can_view ? "cursor-pointer" : "text-muted-foreground"}
                        >
                          Tambah
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${menu.key}-edit`}
                          checked={permission.can_edit}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.id, "can_edit", checked)
                          }
                          disabled={!permission.can_view}
                        />
                        <Label 
                          htmlFor={`${menu.key}-edit`}
                          className={permission.can_view ? "cursor-pointer" : "text-muted-foreground"}
                        >
                          Edit
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${menu.key}-delete`}
                          checked={permission.can_delete}
                          onCheckedChange={(checked) =>
                            updatePermission(permission.id, "can_delete", checked)
                          }
                          disabled={!permission.can_view}
                        />
                        <Label 
                          htmlFor={`${menu.key}-delete`}
                          className={permission.can_view ? "cursor-pointer" : "text-muted-foreground"}
                        >
                          Hapus
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
