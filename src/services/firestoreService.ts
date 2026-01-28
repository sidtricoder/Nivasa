import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../data/listings';

// Firestore collection names
export const COLLECTIONS = {
  PROPERTIES: 'properties',
  USERS: 'users',
};

/**
 * Add a new property to Firestore
 */
export const addProperty = async (property: Omit<Property, 'id'>): Promise<string> => {
  try {
    const propertiesRef = collection(db, COLLECTIONS.PROPERTIES);
    const newPropertyRef = doc(propertiesRef);
    
    const propertyData = {
      ...property,
      id: newPropertyRef.id,
      listedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(newPropertyRef, propertyData);
    return newPropertyRef.id;
  } catch (error: any) {
    throw new Error(`Failed to add property: ${error.message}`);
  }
};

/**
 * Get a property by ID
 */
export const getProperty = async (propertyId: string): Promise<Property | null> => {
  try {
    const propertyRef = doc(db, COLLECTIONS.PROPERTIES, propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (propertySnap.exists()) {
      return propertySnap.data() as Property;
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to get property: ${error.message}`);
  }
};

/**
 * Update a property
 */
export const updateProperty = async (
  propertyId: string,
  updates: Partial<Property>
): Promise<void> => {
  try {
    const propertyRef = doc(db, COLLECTIONS.PROPERTIES, propertyId);
    await updateDoc(propertyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update property: ${error.message}`);
  }
};

/**
 * Delete a property
 */
export const deleteProperty = async (propertyId: string): Promise<void> => {
  try {
    const propertyRef = doc(db, COLLECTIONS.PROPERTIES, propertyId);
    await deleteDoc(propertyRef);
  } catch (error: any) {
    throw new Error(`Failed to delete property: ${error.message}`);
  }
};

/**
 * Get all properties with pagination
 */
export const getAllProperties = async (
  limitCount: number = 20,
  lastDoc?: DocumentData
): Promise<{ properties: Property[]; lastDoc: DocumentData | null }> => {
  try {
    const propertiesRef = collection(db, COLLECTIONS.PROPERTIES);
    const constraints: QueryConstraint[] = [
      orderBy('listedAt', 'desc'),
      limit(limitCount),
    ];
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    const q = query(propertiesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const properties: Property[] = [];
    let last: DocumentData | null = null;
    
    querySnapshot.forEach((doc) => {
      properties.push(doc.data() as Property);
      last = doc;
    });
    
    return { properties, lastDoc: last };
  } catch (error: any) {
    throw new Error(`Failed to get properties: ${error.message}`);
  }
};

/**
 * Search properties by city
 */
export const searchPropertiesByCity = async (
  city: string,
  limitCount: number = 20
): Promise<Property[]> => {
  try {
    const propertiesRef = collection(db, COLLECTIONS.PROPERTIES);
    const q = query(
      propertiesRef,
      where('location.city', '==', city),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push(doc.data() as Property);
    });
    
    // Sort in memory to avoid index requirement
    return properties.sort((a, b) => {
      const dateA = new Date(a.listedAt).getTime();
      const dateB = new Date(b.listedAt).getTime();
      return dateB - dateA;
    });
  } catch (error: any) {
    throw new Error(`Failed to search properties: ${error.message}`);
  }
};

/**
 * Get properties by seller ID
 */
export const getPropertiesBySeller = async (sellerId: string): Promise<Property[]> => {
  try {
    const propertiesRef = collection(db, COLLECTIONS.PROPERTIES);
    const q = query(
      propertiesRef,
      where('seller.id', '==', sellerId)
    );
    
    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push(doc.data() as Property);
    });
    
    // Sort in memory instead of requiring a Firestore index
    return properties.sort((a, b) => {
      const dateA = new Date(a.listedAt).getTime();
      const dateB = new Date(b.listedAt).getTime();
      return dateB - dateA; // Descending order
    });
  } catch (error: any) {
    throw new Error(`Failed to get seller properties: ${error.message}`);
  }
};

/**
 * Get new/featured listings
 */
export const getFeaturedProperties = async (limitCount: number = 10): Promise<Property[]> => {
  try {
    const propertiesRef = collection(db, COLLECTIONS.PROPERTIES);
    const q = query(
      propertiesRef,
      where('isNewListing', '==', true),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push(doc.data() as Property);
    });
    
    // Sort in memory
    return properties.sort((a, b) => {
      const dateA = new Date(a.listedAt).getTime();
      const dateB = new Date(b.listedAt).getTime();
      return dateB - dateA;
    });
  } catch (error: any) {
    throw new Error(`Failed to get featured properties: ${error.message}`);
  }
};

/**
 * Increment property views (for analytics)
 */
export const incrementPropertyViews = async (propertyId: string): Promise<void> => {
  try {
    const propertyRef = doc(db, COLLECTIONS.PROPERTIES, propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (propertySnap.exists()) {
      const currentViews = propertySnap.data().views || 0;
      await updateDoc(propertyRef, {
        views: currentViews + 1,
      });
    }
  } catch (error: any) {
    console.error('Failed to increment views:', error);
  }
};

/**
 * Example usage:
 * 
 * // Add property with Cloudinary images
 * const propertyId = await addProperty({
 *   title: "Beautiful 3BHK",
 *   price: 5000000,
 *   images: ["https://res.cloudinary.com/..."], // Cloudinary URLs
 *   // ... other fields
 * });
 * 
 * // Get all properties
 * const { properties, lastDoc } = await getAllProperties(20);
 * 
 * // Search by city
 * const results = await searchPropertiesByCity("Bangalore");
 */
