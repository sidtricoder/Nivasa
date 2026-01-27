import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Square, Shield, Scale, PawPrint, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/data/listings';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, variant = 'default' }) => {
  const { toggleFavorite, isFavorite, toggleCompare, isInCompare, compareList } = useFavorites();

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const canAddToCompare = compareList.length < 3 || isInCompare(property.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Link to={`/property/${property.id}`}>
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
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
                "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
                isFavorite(property.id) && "text-destructive"
              )}
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(property.id);
              }}
            >
              <Heart className={cn("h-4 w-4", isFavorite(property.id) && "fill-current")} />
            </Button>
            {canAddToCompare && (
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
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

          {/* Walk Score */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground">
              Walk Score: {property.walkScore}
            </Badge>
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
