import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatDrawer } from "@/components/communication";
import ScrollToTop from "@/components/ui/ScrollToTop";

// Lazy load all pages for code splitting - reduces initial bundle size
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const DiscoveryPage = React.lazy(() => import("./pages/DiscoveryPage"));
const PropertyDetailPage = React.lazy(() => import("./pages/PropertyDetailPage"));
const SellerDashboard = React.lazy(() => import("./pages/SellerDashboard"));
const FavoritesPage = React.lazy(() => import("./pages/FavoritesPage"));
const NewsPage = React.lazy(() => import("./pages/NewsPage"));
const ServicesPage = React.lazy(() => import("./pages/ServicesPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const EMICalculatorPage = React.lazy(() => import("./pages/EMICalculatorPage"));
const AllChatsPage = React.lazy(() => import("./pages/AllChatsPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Rich page skeleton for route transitions
const PageLoader = () => (
  <div className="min-h-screen bg-background animate-pulse">
    {/* Navbar skeleton */}
    <div className="h-16 border-b bg-muted/30" />

    {/* Hero section skeleton */}
    <div className="container mx-auto px-4 py-12 space-y-4">
      <div className="h-10 w-2/3 mx-auto bg-muted rounded" />
      <div className="h-5 w-1/2 mx-auto bg-muted rounded" />
    </div>

    {/* Content grid skeleton */}
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/3] bg-muted rounded" />
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ChatDrawer />
            <ScrollToTop />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/discover" element={<DiscoveryPage />} />
                  <Route path="/property/:id" element={<PropertyDetailPage />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/emi-calculator" element={<EMICalculatorPage />} />
                  <Route path="/chats" element={<AllChatsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
