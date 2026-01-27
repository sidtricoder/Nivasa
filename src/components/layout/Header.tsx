import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Heart, User, Sun, Moon, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { favorites, compareList, setIsCompareOpen } = useFavorites();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/discover', label: 'Discover', icon: Search },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/seller', label: 'List Property', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
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
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
                {to === '/favorites' && favorites.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {favorites.length}
                  </Badge>
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
