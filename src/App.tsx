import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatDrawer } from "@/components/communication";
import LandingPage from "./pages/LandingPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import SellerDashboard from "./pages/SellerDashboard";
import FavoritesPage from "./pages/FavoritesPage";
import NewsPage from "./pages/NewsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ChatDrawer />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/discover" element={<DiscoveryPage />} />
                <Route path="/property/:id" element={<PropertyDetailPage />} />
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

