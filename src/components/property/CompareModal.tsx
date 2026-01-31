import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bed, Bath, Square, MapPin, Shield, Check, Minus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFavorites } from '@/contexts/FavoritesContext';
import { mockListings, Property } from '@/data/listings';
import { getAllProperties } from '@/services/firestoreService';
import { Link } from 'react-router-dom';

const CompareModal: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen } = useFavorites();
  const [allProperties, setAllProperties] = useState<Property[]>(mockListings);
  const [loading, setLoading] = useState(true);

  // Load all properties (both mock and Firebase)
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const result = await getAllProperties();
        const firebaseProperties = result.properties || [];
        // Combine mock listings with Firebase properties, avoiding duplicates
        const combinedProperties = [...mockListings];
        firebaseProperties.forEach(fp => {
          if (!combinedProperties.some(mp => mp.id === fp.id)) {
            combinedProperties.push(fp);
          }
        });
        setAllProperties(combinedProperties);
      } catch (error) {
        console.error('Error loading properties for compare:', error);
      } finally {
        setLoading(false);
      }
    };
    if (isCompareOpen) {
      loadProperties();
    }
  }, [isCompareOpen]);

  const properties = compareList
    .map(id => allProperties.find(p => p.id === id))
    .filter((p): p is Property => p !== undefined);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const CompareRow = ({ label, values }: { label: string; values: React.ReactNode[] }) => (
    <div className="grid grid-cols-4 gap-4 py-3 border-b border-border">
      <div className="font-medium text-muted-foreground text-sm">{label}</div>
      {values.map((value, index) => (
        <div key={index} className="text-sm text-foreground">
          {value}
        </div>
      ))}
      {Array.from({ length: 3 - values.length }).map((_, i) => (
        <div key={`empty-${i}`} className="text-sm text-muted-foreground">—</div>
      ))}
    </div>
  );

  const BooleanValue = ({ value }: { value: boolean }) => (
    value ? (
      <Check className="h-4 w-4 text-success" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    )
  );

  return (
    <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Compare Properties ({properties.length}/3)</span>
            <Button variant="ghost" size="sm" onClick={clearCompare}>
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No properties to compare. Add properties from the listing pages.
              </p>
              <Button onClick={() => setIsCompareOpen(false)} asChild>
                <Link to="/discover">Browse Properties</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Property Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div></div>
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                      onClick={() => removeFromCompare(property.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Link to={`/property/${property.id}`} onClick={() => setIsCompareOpen(false)}>
                      <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                        {property.title}
                      </h4>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Separator />

              {/* Comparison Table */}
              <CompareRow
                label="Price"
                values={properties.map(p => (
                  <span className="font-bold text-primary">{formatPrice(p.price)}</span>
                ))}
              />
              <CompareRow
                label="Price/sqft"
                values={properties.map(p => `₹${p.pricePerSqft.toLocaleString()}`)}
              />
              <CompareRow
                label="Location"
                values={properties.map(p => `${p.location.locality}, ${p.location.city}`)}
              />
              <CompareRow
                label="Configuration"
                values={properties.map(p => `${p.specs.bhk} BHK`)}
              />
              <CompareRow
                label="Area"
                values={properties.map(p => `${p.specs.sqft} sqft`)}
              />
              <CompareRow
                label="Bathrooms"
                values={properties.map(p => p.specs.bathrooms.toString())}
              />
              <CompareRow
                label="Floor"
                values={properties.map(p => `${p.specs.floor}/${p.specs.totalFloors}`)}
              />
              <CompareRow
                label="Facing"
                values={properties.map(p => p.specs.facing)}
              />
              <CompareRow
                label="Property Age"
                values={properties.map(p => `${p.specs.propertyAge} years`)}
              />
              <CompareRow
                label="Furnishing"
                values={properties.map(p => p.specs.furnishing.replace('-', ' '))}
              />
              <CompareRow
                label="Walk Score"
                values={properties.map(p => (
                  <Badge variant="secondary">{p.walkScore}</Badge>
                ))}
              />
              <CompareRow
                label="Owner Verified"
                values={properties.map(p => <BooleanValue value={p.verification.ownerVerified} />)}
              />
              <CompareRow
                label="Documents Ready"
                values={properties.map(p => <BooleanValue value={p.verification.documentsReady} />)}
              />
              <CompareRow
                label="RERA Approved"
                values={properties.map(p => <BooleanValue value={p.verification.reraApproved} />)}
              />
              <CompareRow
                label="Pet Friendly"
                values={properties.map(p => <BooleanValue value={p.isPetFriendly} />)}
              />
              <CompareRow
                label="Parking"
                values={properties.map(p => <BooleanValue value={p.hasParking} />)}
              />
              <CompareRow
                label="Amenities"
                values={properties.map(p => (
                  <div className="flex flex-wrap gap-1">
                    {p.amenities.slice(0, 3).map(amenity => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {p.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{p.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                ))}
              />
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CompareModal;
