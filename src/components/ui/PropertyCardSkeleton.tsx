import React from 'react';
import { Card, CardContent } from './card';

const PropertyCardSkeleton: React.FC = () => {
    return (
        <Card className="overflow-hidden">
            <div className="relative">
                {/* Image skeleton */}
                <div className="h-56 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
            </div>

            <CardContent className="p-6">
                {/* Title skeleton */}
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded w-3/4 mb-3" />

                {/* Location skeleton */}
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded w-1/2 mb-4" />

                {/* Specs skeleton */}
                <div className="flex gap-4 mb-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded w-16" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded w-16" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded w-16" />
                </div>

                {/* Price skeleton */}
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded w-32 mb-4" />

                {/* Buttons skeleton */}
                <div className="flex gap-2">
                    <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded flex-1" />
                    <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded w-10" />
                </div>
            </CardContent>
        </Card>
    );
};

export default PropertyCardSkeleton;
