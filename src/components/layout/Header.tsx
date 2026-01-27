import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Heart, User, Sun, Moon, Scale, Newspaper, Building2, Key, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { InboxButton } from '@/components/communication';
import { cn } from '@/lib/utils';

type UserType = 'buy' | 'rent' | 'sell';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { favorites, compareList, setIsCompareOpen } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  
  // User type state - could be moved to context for global state
  const [userType, setUserType] = useState<UserType>('buy');

  const handleUserTypeChange = (type: string) => {
    setUserType(type as UserType);
    // Navigate to discover with appropriate filter
    if (type === 'sell') {
      navigate('/seller');
    } else {
      navigate(`/discover?type=${type}`);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/discover', label: 'Discover', icon: Search },
    { to: '/news', label: 'News', icon: Newspaper },
    { to: '/favorites', label: 'Favorites', icon: Heart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      {/* User Type Tabs - Top Row */}
      <div className="border-b border-border bg-secondary/30">
        <div className="container flex items-center justify-center py-1">
          <Tabs value={userType} onValueChange={handleUserTypeChange} className="w-auto">
            <TabsList className="h-8 bg-transparent">
              <TabsTrigger 
                value="buy" 
                className={cn(
                  "gap-1.5 text-xs px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                )}
              >
                <Building2 className="h-3.5 w-3.5" />
                Buy
              </TabsTrigger>
              <TabsTrigger 
                value="rent"
                className={cn(
                  "gap-1.5 text-xs px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                )}
              >
                <Key className="h-3.5 w-3.5" />
                Rent
              </TabsTrigger>
              <TabsTrigger 
                value="sell"
                className={cn(
                  "gap-1.5 text-xs px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                )}
              >
                <DollarSign className="h-3.5 w-3.5" />
                Sell
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">HavenHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={isActive(to) ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
                {to === '/favorites' && favorites.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {favorites.length}
                  </Badge>
                )}
                {to === '/news' && (
                  <Badge className="ml-1 h-4 text-[10px] bg-red-500 text-white">NEW</Badge>
                )}
              </Button>
            </Link>
          ))}
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

          {/* List Property Button */}
          <Link to="/seller" className="hidden lg:block">
            <Button size="sm" className="gap-2">
              <DollarSign className="h-4 w-4" />
              List Property
            </Button>
          </Link>

          {/* Inbox / Messages */}
          <InboxButton />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Favorites */}
          <Link to="/favorites" className="md:hidden relative">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="h-4 w-4" />
              {favorites.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
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
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col gap-1 h-auto py-2 ${isActive(to) ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;
