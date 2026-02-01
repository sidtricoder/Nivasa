import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Square, Shield, Scale, PawPrint, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/data/listings';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, variant = 'default' }) => {
  const { toggleFavorite, isFavorite, toggleCompare, isInCompare, compareList } = useFavorites();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save properties to your favorites.',
        variant: 'default',
      });
      return;
    }
    toggleFavorite(property.id);
  };

  const canAddToCompare = compareList.length < 3 || isInCompare(property.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group overflow-hidden h-full border-0 shadow-lg hover:shadow-2xl rounded-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:bg-white">

        {/* Image Container */}
        <div className={`relative overflow-hidden ${variant === 'compact' ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
          <Link to={`/property/${property.id}`}>
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
            />
            {/* Subtle overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {property.isNewListing && (
              <Badge className="bg-primary text-primary-foreground">New</Badge>
            )}
            {property.verification.ownerVerified && (
              <Badge variant="secondary" className="bg-success text-success-foreground gap-1">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg",
                isFavorite(property.id) && "text-destructive"
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn("h-4 w-4 transition-all", isFavorite(property.id) && "fill-current scale-110")} />
            </Button>
            {canAddToCompare && (
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg",
                  isInCompare(property.id) && "text-primary bg-primary/10"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  toggleCompare(property.id);
                }}
              >
                <Scale className="h-4 w-4" />
              </Button>
            )}
          </div>


        </div>

        <CardContent className="p-4 space-y-3">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">
              {formatPrice(property.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              ₹{property.pricePerSqft.toLocaleString()}/sqft
            </span>
          </div>

          {/* Title */}
          <Link to={`/property/${property.id}`}>
            <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{property.location.locality}, {property.location.city}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.specs.bhk} BHK</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.specs.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.specs.sqft} sqft</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-2">
            {property.isPetFriendly && (
              <Badge variant="outline" className="gap-1 text-xs">
                <PawPrint className="h-3 w-3" />
                Pet Friendly
              </Badge>
            )}
            {property.hasParking && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Car className="h-3 w-3" />
                Parking
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PropertyCard;
