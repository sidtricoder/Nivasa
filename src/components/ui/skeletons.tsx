import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Skeleton for PropertyCard component - matches exact layout
 */
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <Card className="group overflow-hidden h-full border-0 shadow-none rounded-none">
      {/* Image Container Skeleton */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Badge placeholders */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        {/* Action buttons placeholder */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        {/* Walk score badge placeholder */}
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Price row */}
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Location */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Feature badges */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Grid of property card skeletons
 */
export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for news/article cards
 */
export const NewsCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Grid of news card skeletons
 */
export const NewsGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Landing page hero skeleton
 */
export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Skeleton className="absolute inset-0" />
      <div className="relative z-10 container mx-auto px-4 text-center space-y-6">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-32 rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Property detail page skeleton
 */
export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-16 border-b">
        <Skeleton className="h-full w-full" />
      </div>
      
      {/* Image gallery skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-2 h-[500px]">
          <Skeleton className="col-span-2 row-span-2 rounded-l-lg" />
          <Skeleton className="rounded-none" />
          <Skeleton className="rounded-tr-lg" />
          <Skeleton className="rounded-none" />
          <Skeleton className="rounded-br-lg" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generic page content skeleton
 */
export const PageContentSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar placeholder */}
      <Skeleton className="h-16 w-full" />
      
      {/* Hero section placeholder */}
      <div className="container mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-2/3 mx-auto" />
      </div>

      {/* Content grid placeholder */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard/seller skeleton
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-16 w-full" />
      <div className="container mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
