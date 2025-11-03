import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { YearFilterProvider } from "@/contexts/YearFilterContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Kegiatan from "./pages/Kegiatan";
import POK from "./pages/POK";
import Pencairan from "./pages/Pencairan";
import Eviden from "./pages/Eviden";
import Akun from "./pages/Akun";
import ERD from "./pages/ERD";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <YearFilterProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/kegiatan" element={<ProtectedRoute><DashboardLayout><Kegiatan /></DashboardLayout></ProtectedRoute>} />
              <Route path="/pok" element={<ProtectedRoute><DashboardLayout><POK /></DashboardLayout></ProtectedRoute>} />
              <Route path="/pencairan" element={<ProtectedRoute><DashboardLayout><Pencairan /></DashboardLayout></ProtectedRoute>} />
              <Route path="/eviden" element={<ProtectedRoute><DashboardLayout><Eviden /></DashboardLayout></ProtectedRoute>} />
              <Route path="/akun" element={<ProtectedRoute><DashboardLayout><Akun /></DashboardLayout></ProtectedRoute>} />
              <Route path="/erd" element={<ProtectedRoute><DashboardLayout><ERD /></DashboardLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </YearFilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
