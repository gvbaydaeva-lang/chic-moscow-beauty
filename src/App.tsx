import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Booking from "./pages/Booking";
import Privacy from "./pages/Privacy";
import Offer from "./pages/Offer";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminServicesRoute from "./pages/AdminServicesRoute";
import AdminMastersRoute from "./pages/AdminMastersRoute";
import AdminPromotionsRoute from "./pages/AdminPromotionsRoute";
import AdminSettingsRoute from "./pages/AdminSettingsRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/offer" element={<Offer />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/services" element={<AdminServicesRoute />} />
            <Route path="/admin/masters" element={<AdminMastersRoute />} />
            <Route path="/admin/promotions" element={<AdminPromotionsRoute />} />
            <Route path="/admin/settings" element={<AdminSettingsRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
