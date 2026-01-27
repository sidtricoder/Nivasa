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
    <div className="min-h-screen bg-background">
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
