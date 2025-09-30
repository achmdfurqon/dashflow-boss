import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Kegiatan from "./pages/Kegiatan";
import POK from "./pages/POK";
import Pencairan from "./pages/Pencairan";
import Eviden from "./pages/Eviden";
import Media from "./pages/Media";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/kegiatan" element={<DashboardLayout><Kegiatan /></DashboardLayout>} />
          <Route path="/pok" element={<DashboardLayout><POK /></DashboardLayout>} />
          <Route path="/pencairan" element={<DashboardLayout><Pencairan /></DashboardLayout>} />
          <Route path="/eviden" element={<DashboardLayout><Eviden /></DashboardLayout>} />
          <Route path="/media" element={<DashboardLayout><Media /></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
