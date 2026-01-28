/**
 * Example: Extending User Profile with Custom Fields
 * 
 * This file shows how to add custom fields to user profiles
 * beyond the basic authentication data.
 */

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserData } from './authService';

// Extended user profile interface
export interface ExtendedUserData extends UserData {
  // Contact Information
  phoneNumber?: string;
  whatsappNumber?: string;
  alternateEmail?: string;
  
  // Location
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Preferences
  preferredLanguage?: string;
  propertyPreferences?: {
    type?: 'buy' | 'rent' | 'both';
    budgetMin?: number;
    budgetMax?: number;
    preferredLocations?: string[];
    bedrooms?: number;
    propertyType?: 'apartment' | 'house' | 'villa' | 'plot';
  };
  
  // User Role & Type
  role?: 'buyer' | 'seller' | 'agent' | 'owner';
  verified?: boolean;
  
  // Real Estate Professional Info (for agents/sellers)
  reraNumber?: string;
  agencyName?: string;
  yearsOfExperience?: number;
  specialization?: string[];
  
  // Activity Tracking
  favoriteProperties?: string[];
  viewedProperties?: string[];
  savedSearches?: any[];
  
  // Notifications
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  whatsappNotifications?: boolean;
  
  // Metadata
  profileCompleteness?: number; // 0-100
  lastProfileUpdate?: any;
  accountStatus?: 'active' | 'inactive' | 'suspended';
}

/**
 * Update user profile with custom fields
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<ExtendedUserData>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      lastProfileUpdate: new Date(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  uid: string,
  preferences: ExtendedUserData['propertyPreferences']
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      propertyPreferences: preferences,
      lastProfileUpdate: new Date(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update preferences: ${error.message}`);
  }
};

/**
 * Add property to favorites
 */
export const addToFavorites = async (
  uid: string,
  propertyId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const { getDoc, arrayUnion } = await import('firebase/firestore');
    
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as ExtendedUserData;
    const currentFavorites = userData.favoriteProperties || [];
    
    if (!currentFavorites.includes(propertyId)) {
      await updateDoc(userRef, {
        favoriteProperties: arrayUnion(propertyId),
      });
    }
  } catch (error: any) {
    throw new Error(`Failed to add favorite: ${error.message}`);
  }
};

/**
 * Remove property from favorites
 */
export const removeFromFavorites = async (
  uid: string,
  propertyId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const { arrayRemove } = await import('firebase/firestore');
    
    await updateDoc(userRef, {
      favoriteProperties: arrayRemove(propertyId),
    });
  } catch (error: any) {
    throw new Error(`Failed to remove favorite: ${error.message}`);
  }
};

/**
 * Track property view
 */
export const trackPropertyView = async (
  uid: string,
  propertyId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const { getDoc, arrayUnion } = await import('firebase/firestore');
    
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as ExtendedUserData;
    const currentViewed = userData.viewedProperties || [];
    
    // Keep only last 50 viewed properties
    const updatedViewed = [propertyId, ...currentViewed.filter(id => id !== propertyId)].slice(0, 50);
    
    await updateDoc(userRef, {
      viewedProperties: updatedViewed,
    });
  } catch (error: any) {
    console.error('Failed to track property view:', error);
    // Don't throw - viewing tracking shouldn't break the app
  }
};

/**
 * Calculate profile completeness
 */
export const calculateProfileCompleteness = (user: ExtendedUserData): number => {
  const fields = [
    user.displayName,
    user.email,
    user.phoneNumber,
    user.city,
    user.propertyPreferences?.type,
    user.photoURL,
  ];
  
  const completed = fields.filter(field => field !== null && field !== undefined).length;
  return Math.round((completed / fields.length) * 100);
};

/**
 * Example usage in a component:
 * 
 * import { useAuth } from '@/contexts/AuthContext';
 * import { updateUserPreferences } from '@/services/userProfileService';
 * 
 * function PreferencesForm() {
 *   const { currentUser } = useAuth();
 *   
 *   const handleSave = async (preferences) => {
 *     await updateUserPreferences(currentUser.uid, preferences);
 *   };
 *   
 *   return <form onSubmit={handleSave}>...</form>;
 * }
 */
