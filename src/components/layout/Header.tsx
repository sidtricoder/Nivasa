import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Heart, 
  Scale, 
  Newspaper, 
  Building2, 
  Key, 
  MapPin,
  ChevronDown,
  TrendingUp,
  Users,
  Calculator,
  Info,
  Mail,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useFavorites } from '@/contexts/FavoritesContext';
import { InboxButton } from '@/components/communication';
import { UserProfile } from '@/components/auth';
import { cn } from '@/lib/utils';

// Popular cities data
const popularCities = [
  'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'
];

const Header: React.FC = () => {
  const { favorites, compareList, setIsCompareOpen } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isDiscoverHovered, setIsDiscoverHovered] = useState(false);
  const [isNewsHovered, setIsNewsHovered] = useState(false);
  const [isCompanyHovered, setIsCompanyHovered] = useState(false);

  const handleDiscoverClick = (type: 'buy' | 'rent', city?: string) => {
    const params = new URLSearchParams();
    params.set('type', type);
    if (city) params.set('city', city);
    navigate(`/discover?${params.toString()}`);
    setIsDiscoverHovered(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/news', label: 'News', icon: Newspaper },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/seller', label: 'Post Property', icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  // Check if on homepage for transparent header with white text
  const isHomePage = location.pathname === '/';
  
  // Dynamic classes based on page
  const headerBg = isHomePage ? 'bg-transparent' : 'bg-background/95 backdrop-blur border-b border-border';
  const textColor = isHomePage ? 'text-white' : 'text-foreground';
  const hoverBg = isHomePage ? 'hover:bg-white/40 hover:text-white' : 'hover:bg-secondary';

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${isHomePage ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 w-full ${headerBg}`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-12 w-12 rounded-lg overflow-hidden">
            <img 
              src="/logo.jpeg" 
              alt="Nivasa Logo" 
              className="h-full w-full object-cover scale-[1.8]"
            />
          </div>
          <span className={`text-xl font-bold ${textColor}`}>Nivasa</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Home Link */}
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${textColor} ${hoverBg}`}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>

          {/* Discover with Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsDiscoverHovered(true)}
            onMouseLeave={() => setIsDiscoverHovered(false)}
          >
            <Link to="/discover">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${textColor} ${hoverBg}`}
              >
                <Search className="h-4 w-4" />
                Discover
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isDiscoverHovered && "rotate-180"
                )} />
              </Button>
            </Link>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
              {isDiscoverHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full pt-2 z-50"
                >
                  <div className="bg-background border border-border rounded-lg shadow-xl p-6 min-w-[500px]">
                    <div className="grid grid-cols-2 gap-8">
                      {/* For Buyers */}
                      <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">For Buyers</h3>
                            <p className="text-xs text-muted-foreground">Properties for sale</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {popularCities.slice(0, 6).map((city) => (
                            <button
                              key={city}
                              onClick={() => handleDiscoverClick('buy', city)}
                              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors flex items-center gap-2"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Properties in {city}
                            </button>
                          ))}
                          <button
                            onClick={() => handleDiscoverClick('buy')}
                            className="w-full text-left px-3 py-2 text-sm text-primary font-medium hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                            View All Properties
                          </button>
                        </div>
                      </div>

                      {/* For Tenants */}
                      <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Key className="h-4 w-4 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">For Tenants</h3>
                            <p className="text-xs text-muted-foreground">Properties for rent</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {popularCities.slice(0, 6).map((city) => (
                            <button
                              key={city}
                              onClick={() => handleDiscoverClick('rent', city)}
                              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors flex items-center gap-2"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Rentals in {city}
                            </button>
                          ))}
                          <button
                            onClick={() => handleDiscoverClick('rent')}
                            className="w-full text-left px-3 py-2 text-sm text-orange-500 font-medium hover:bg-orange-500/10 rounded-md transition-colors flex items-center gap-2"
                          >
                            <Users className="h-3.5 w-3.5" />
                            View All Rentals
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* News with Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsNewsHovered(true)}
            onMouseLeave={() => setIsNewsHovered(false)}
          >
            <Link to="/news">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${textColor} ${hoverBg}`}
              >
                <Newspaper className="h-4 w-4" />
                News
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isNewsHovered && "rotate-180"
                )} />
              </Button>
            </Link>

            {/* News Dropdown */}
            <AnimatePresence>
              {isNewsHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full pt-2 z-50"
                >
                  <div className="bg-background border border-border rounded-lg shadow-xl p-4 min-w-[280px]">
                    <div className="space-y-1">
                      <Link 
                        to="/news" 
                        onClick={() => setIsNewsHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Newspaper className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">All News</p>
                          <p className="text-xs text-muted-foreground">Latest updates</p>
                        </div>
                      </Link>
                      <Link 
                        to="/news?category=market" 
                        onClick={() => setIsNewsHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Market</p>
                          <p className="text-xs text-muted-foreground">Price trends & analysis</p>
                        </div>
                      </Link>
                      <Link 
                        to="/news?category=policy" 
                        onClick={() => setIsNewsHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Policy</p>
                          <p className="text-xs text-muted-foreground">RERA & regulations</p>
                        </div>
                      </Link>
                      <Link 
                        to="/news?category=investment" 
                        onClick={() => setIsNewsHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Investment</p>
                          <p className="text-xs text-muted-foreground">ROI & opportunities</p>
                        </div>
                      </Link>
                      <Link 
                        to="/news?category=trends" 
                        onClick={() => setIsNewsHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Trends</p>
                          <p className="text-xs text-muted-foreground">Smart homes & tech</p>
                        </div>
                      </Link>
                      <Link 
                        to="/news?category=city" 
                        onClick={() => setIsNewsHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-cyan-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">City News</p>
                          <p className="text-xs text-muted-foreground">Local updates</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Favorites */}
          <Link to="/favorites">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${textColor} ${hoverBg}`}
            >
              <Heart className="h-4 w-4" />
              Favorites
              {favorites.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {favorites.length}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Services */}
          <Link to="/services">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${textColor} ${hoverBg}`}
            >
              <Calculator className="h-4 w-4" />
              Services
            </Button>
          </Link>

          {/* Company with Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsCompanyHovered(true)}
            onMouseLeave={() => setIsCompanyHovered(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${textColor} ${hoverBg}`}
            >
              <Info className="h-4 w-4" />
              Company
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform",
                isCompanyHovered && "rotate-180"
              )} />
            </Button>

            {/* Company Dropdown */}
            <AnimatePresence>
              {isCompanyHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full pt-2 z-50"
                >
                  <div className="bg-background border border-border rounded-lg shadow-xl p-4 min-w-[280px]">
                    <div className="space-y-1">
                      <Link 
                        to="/about" 
                        onClick={() => setIsCompanyHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">About Us</p>
                          <p className="text-xs text-muted-foreground">Our story & mission</p>
                        </div>
                      </Link>
                      <Link 
                        to="/contact" 
                        onClick={() => setIsCompanyHovered(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Contact Us</p>
                          <p className="text-xs text-muted-foreground">Get in touch</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Post Property */}
          <Link to="/seller">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${textColor} ${hoverBg}`}
            >
              <Building2 className="h-4 w-4" />
              Post Property
            </Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Compare Button */}
          {compareList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompareOpen(true)}
              className="hidden sm:flex gap-2"
            >
              <Scale className="h-4 w-4" />
              Compare ({compareList.length}/3)
            </Button>
          )}

          {/* Inbox / Messages */}
          <InboxButton className={`${textColor} ${hoverBg}`} />

          {/* User Profile / Auth */}
          <UserProfile />

          {/* Mobile Favorites */}
          <Link to="/favorites" className="md:hidden relative">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="h-4 w-4" />
              {favorites.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {favorites.length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t border-border">
        <div className="container flex items-center justify-around py-2">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-col gap-1 h-auto py-2 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          <Link to="/discover">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-col gap-1 h-auto py-2 ${isActive('/discover') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Discover</span>
            </Button>
          </Link>
          <Link to="/news">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-col gap-1 h-auto py-2 ${isActive('/news') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Newspaper className="h-5 w-5" />
              <span className="text-xs">News</span>
            </Button>
          </Link>
          <Link to="/seller">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-col gap-1 h-auto py-2 ${isActive('/seller') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Post</span>
            </Button>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
