import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Property } from '@/data/listings';

interface MinimalPropertyCardProps {
  property: Property;
}

const MinimalPropertyCard: React.FC<MinimalPropertyCardProps> = ({ property }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/property/${property.id}`} className="block">
        {/* Image Container - No border radius */}
        <div className="relative aspect-[4/3] overflow-hidden mb-4">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content - Simple text like HavenHub */}
        <div className="space-y-1">
          {/* Title - Bold, black */}
          <h3 className="font-bold text-base text-foreground line-clamp-1">
            {property.title}
          </h3>
          
          {/* Location - Grey text, no icon */}
          <p className="text-sm text-muted-foreground">
            {property.location.locality}, {property.location.city}
          </p>
          
          {/* Area - Gray, smaller */}
          <p className="text-sm text-muted-foreground">
            Area: {property.specs.sqft.toLocaleString()} sqft
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default MinimalPropertyCard;
