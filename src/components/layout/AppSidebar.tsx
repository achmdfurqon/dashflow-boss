import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  FileText, 
  Package,
  Users,
  LogOut,
  Network
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type UserRole = "admin" | "staf_keuangan" | "staf_biasa";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  roles: UserRole[];
}

const items: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "staf_keuangan", "staf_biasa"] },
  { title: "Kegiatan", url: "/kegiatan", icon: Calendar, roles: ["admin", "staf_keuangan", "staf_biasa"] },
  { title: "POK", url: "/pok", icon: DollarSign, roles: ["admin", "staf_keuangan"] },
  { title: "Pencairan", url: "/pencairan", icon: Package, roles: ["admin", "staf_keuangan"] },
  { title: "Eviden", url: "/eviden", icon: FileText, roles: ["admin", "staf_keuangan", "staf_biasa"] },
  { title: "ERD", url: "/erd", icon: Network, roles: ["admin", "staf_keuangan", "staf_biasa"] },
  { title: "Akun", url: "/akun", icon: Users, roles: ["admin"] },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { profile, userRole, signOut } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredItems = items.filter((item) => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">EA</span>
          </div>
          {open && (
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">Eviden Admin</p>
              <p className="text-xs text-sidebar-foreground/60">Management System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-primary" 
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        {open && (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-sidebar-foreground">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
            <Separator className="my-1" />
          </>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
