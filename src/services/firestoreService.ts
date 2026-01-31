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
  AI_QUERIES: 'ai_queries',
  AI_CHATS: 'ai_property_chats',
  LEADS: 'property_leads',
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

// Alias for consistency
export const getPropertyById = getProperty;

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

// AI Search Query Interface
export interface AISearchQuery {
  id?: string;
  rawQuery: string;
  extractedFilters: Record<string, any>;
  resultsCount: number;
  timestamp: any;
  userAgent?: string;
  landmarkSearched?: string;
}

/**
 * Save an AI search query to Firebase for analytics
 */
export const saveAISearchQuery = async (queryData: Omit<AISearchQuery, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const queriesRef = collection(db, COLLECTIONS.AI_QUERIES);
    const newQueryRef = doc(queriesRef);
    
    const searchData = {
      ...queryData,
      id: newQueryRef.id,
      timestamp: serverTimestamp(),
    };
    
    await setDoc(newQueryRef, searchData);
    return newQueryRef.id;
  } catch (error: any) {
    console.error('Failed to save AI query:', error);
    // Don't throw - we don't want to break the search if analytics fails
    return '';
  }
};

/**
 * Get all AI search queries (for analytics dashboard)
 */
export const getAISearchQueries = async (limitCount: number = 100): Promise<AISearchQuery[]> => {
  try {
    const queriesRef = collection(db, COLLECTIONS.AI_QUERIES);
    const q = query(
      queriesRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const queries: AISearchQuery[] = [];
    
    querySnapshot.forEach((doc) => {
      queries.push(doc.data() as AISearchQuery);
    });
    
    return queries;
  } catch (error: any) {
    console.error('Failed to get AI queries:', error);
    return [];
  }
};

// AI Property Chat Interfaces
export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIPropertyChat {
  id?: string;
  propertyId: string;
  propertyTitle: string;
  userId?: string;
  sessionId: string;
  messages: AIChatMessage[];
  createdAt: any;
  updatedAt: any;
}

/**
 * Save or update an AI property chat session
 */
export const saveAIPropertyChat = async (
  chatData: Omit<AIPropertyChat, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Use propertyId + sessionId as document ID for upsert behavior
    const docId = `${chatData.propertyId}_${chatData.sessionId}`;
    const chatRef = doc(db, COLLECTIONS.AI_CHATS, docId);
    const existingDoc = await getDoc(chatRef);

    if (existingDoc.exists()) {
      // Update existing chat
      await updateDoc(chatRef, {
        messages: chatData.messages,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new chat
      await setDoc(chatRef, {
        ...chatData,
        id: docId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    return docId;
  } catch (error: any) {
    console.error('Failed to save AI chat:', error);
    return '';
  }
};

/**
 * Get an AI property chat by session
 */
export const getAIPropertyChat = async (
  propertyId: string,
  sessionId: string
): Promise<AIPropertyChat | null> => {
  try {
    const docId = `${propertyId}_${sessionId}`;
    const chatRef = doc(db, COLLECTIONS.AI_CHATS, docId);
    const chatSnap = await getDoc(chatRef);
    
    if (chatSnap.exists()) {
      return chatSnap.data() as AIPropertyChat;
    }
    return null;
  } catch (error: any) {
    console.error('Failed to get AI chat:', error);
    return null;
  }
};

/**
 * Get all AI chats for a property (for analytics)
 */
export const getAIChatsForProperty = async (
  propertyId: string,
  limitCount: number = 50
): Promise<AIPropertyChat[]> => {
  try {
    const chatsRef = collection(db, COLLECTIONS.AI_CHATS);
    const q = query(
      chatsRef,
      where('propertyId', '==', propertyId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const chats: AIPropertyChat[] = [];
    
    querySnapshot.forEach((doc) => {
      chats.push(doc.data() as AIPropertyChat);
    });
    
    return chats;
  } catch (error: any) {
    console.error('Failed to get AI chats for property:', error);
    return [];
  }
};

/**
 * Lead/Interest types and interfaces
 */
export interface PropertyLead {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  sellerId: string;
  createdAt: any;
  status: 'new' | 'contacted' | 'visited' | 'closed';
}

/**
 * Express interest in a property
 */
export const expressInterest = async (
  propertyId: string,
  userId: string,
  userName: string,
  userEmail: string,
  sellerId: string,
  userPhone?: string
): Promise<string> => {
  try {
    const leadsRef = collection(db, COLLECTIONS.LEADS);
    const leadId = `${propertyId}_${userId}`;
    const leadRef = doc(leadsRef, leadId);
    
    // Check if lead already exists
    const existingLead = await getDoc(leadRef);
    if (existingLead.exists()) {
      throw new Error('You have already expressed interest in this property');
    }
    
    const leadData: PropertyLead = {
      id: leadId,
      propertyId,
      userId,
      userName,
      userEmail,
      sellerId,
      createdAt: serverTimestamp(),
      status: 'new',
    };
    
    // Only add userPhone if it's provided (not undefined)
    if (userPhone) {
      leadData.userPhone = userPhone;
    }
    
    await setDoc(leadRef, leadData);
    return leadId;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to express interest');
  }
};

/**
 * Check if user has already expressed interest
 */
export const checkUserInterest = async (
  propertyId: string,
  userId: string
): Promise<boolean> => {
  try {
    const leadId = `${propertyId}_${userId}`;
    const leadRef = doc(db, COLLECTIONS.LEADS, leadId);
    const leadSnap = await getDoc(leadRef);
    return leadSnap.exists();
  } catch (error: any) {
    console.error('Failed to check user interest:', error);
    return false;
  }
};

/**
 * Get all leads for a seller
 */
export const getLeadsBySeller = async (sellerId: string): Promise<PropertyLead[]> => {
  try {
    const leadsRef = collection(db, COLLECTIONS.LEADS);
    const q = query(
      leadsRef,
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const leads: PropertyLead[] = [];
    
    querySnapshot.forEach((doc) => {
      leads.push(doc.data() as PropertyLead);
    });
    
    return leads;
  } catch (error: any) {
    console.error('Failed to get leads:', error);
    return [];
  }
};

/**
 * Get leads for a specific property
 */
export const getLeadsByProperty = async (propertyId: string): Promise<PropertyLead[]> => {
  try {
    const leadsRef = collection(db, COLLECTIONS.LEADS);
    const q = query(
      leadsRef,
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const leads: PropertyLead[] = [];
    
    querySnapshot.forEach((doc) => {
      leads.push(doc.data() as PropertyLead);
    });
    
    return leads;
  } catch (error: any) {
    console.error('Failed to get property leads:', error);
    return [];
  }
};

export const updateLeadStatus = async (
  leadId: string,
  status: PropertyLead['status']
): Promise<void> => {
  try {
    const leadRef = doc(db, COLLECTIONS.LEADS, leadId);
    await updateDoc(leadRef, { status });
  } catch (error: any) {
    throw new Error('Failed to update lead status');
  }
};

/**
 * Get properties by seller email (fallback for ownership lookup)
 */
export const getPropertiesBySellerEmail = async (email: string): Promise<Property[]> => {
  try {
    const propertiesRef = collection(db, COLLECTIONS.PROPERTIES);
    const q = query(
      propertiesRef,
      where('seller.email', '==', email)
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
    throw new Error(`Failed to get properties by email: ${error.message}`);
  }
};

/**
 * Seed mock properties to Firestore with a specific seller
 */
export const seedPropertiesToFirestore = async (
  sellerId: string,
  sellerName: string,
  sellerEmail: string,
  sellerPhone?: string
): Promise<{ success: number; failed: number }> => {
  // Import mock listings dynamically to avoid circular imports
  const { mockListings } = await import('../data/listings');
  
  let success = 0;
  let failed = 0;
  
  for (const property of mockListings) {
    try {
      const propertyRef = doc(db, COLLECTIONS.PROPERTIES, property.id);
      
      // Check if property already exists
      const existingDoc = await getDoc(propertyRef);
      if (existingDoc.exists()) {
        console.log(`Property ${property.id} already exists, updating seller info...`);
        // Update seller info for existing properties
        await updateDoc(propertyRef, {
          seller: {
            id: sellerId,
            name: sellerName,
            email: sellerEmail,
            phone: sellerPhone || '+91 98765 43210',
            isVerified: true,
            memberSince: '2024-01-01',
            responseRate: 95,
          },
          updatedAt: serverTimestamp(),
        });
        success++;
        continue;
      }
      
      // Create new property with seller info
      const propertyData = {
        ...property,
        seller: {
          id: sellerId,
          name: sellerName,
          email: sellerEmail,
          phone: sellerPhone || '+91 98765 43210',
          isVerified: true,
          memberSince: '2024-01-01',
          responseRate: 95,
        },
        listedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(propertyRef, propertyData);
      success++;
      console.log(`Seeded property: ${property.id} - ${property.title}`);
    } catch (error: any) {
      console.error(`Failed to seed property ${property.id}:`, error);
      failed++;
    }
  }
  
  return { success, failed };
};
