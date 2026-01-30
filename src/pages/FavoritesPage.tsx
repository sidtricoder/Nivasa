import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import CompareModal from '@/components/property/CompareModal';
import { mockListings } from '@/data/listings';
import { useFavorites } from '@/contexts/FavoritesContext';

const FavoritesPage: React.FC = () => {
  const { favorites, removeFavorite } = useFavorites();

  const favoriteProperties = mockListings.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Soft flowing gradient background - flowing top-right to bottom-left */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(315deg, 
              rgba(230, 210, 220, 0.6) 0%,
              rgba(240, 238, 233, 0.9) 25%,
              rgba(245, 243, 240, 1) 50%,
              rgba(220, 225, 240, 0.7) 75%,
              rgba(255, 210, 200, 0.5) 100%
            )
          `
        }}
      />
      
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Warm coral blob - top right */}
        <div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 190, 170, 0.6) 0%, rgba(255, 170, 150, 0.3) 50%, transparent 70%)'
          }}
        />
        
        {/* Soft lavender blob - bottom left */}
        <div 
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(200, 190, 230, 0.6) 0%, rgba(180, 170, 220, 0.3) 50%, transparent 70%)'
          }}
        />
        
        {/* Pink blob - center */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(230, 200, 220, 0.5) 0%, transparent 60%)'
          }}
        />
        
        {/* Cool blue blob - bottom right */}
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(180, 200, 240, 0.5) 0%, transparent 60%)'
          }}
        />
      </div>

      <Header />
      <CompareModal />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Saved Properties</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
          {favorites.length > 0 && (
            <Button
              variant="outline"
              onClick={() => favorites.forEach(id => removeFavorite(id))}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No saved properties yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start exploring and save properties you like by clicking the heart icon on any listing.
            </p>
            <Link to="/discover">
              <Button className="gap-2">
                <Search className="h-4 w-4" />
                Browse Properties
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
