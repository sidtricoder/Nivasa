/**
 * Firebase Chat Service
 * Manages real-time chat messages using Firestore
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ChatMessage {
  id?: string;
  conversationId: string; // Unique ID for the conversation
  to: string; // Receiver user ID
  from: string; // Sender user ID
  relatedProperty: string; // Property ID
  timestamp: Date;
  text: string;
  isRead?: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[]; // Array of user IDs
  propertyId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  propertyTitle?: string;
  propertyImage?: string;
}

const CHATS_COLLECTION = 'chats';
const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Send a chat message
 */
export const sendChatMessage = async (
  from: string,
  to: string,
  relatedProperty: string,
  text: string
): Promise<string> => {
  try {
    // Generate consistent conversation ID
    const participants = [from, to].sort();
    const conversationId = `${participants[0]}_${participants[1]}_${relatedProperty}`;

    const messageData: Omit<ChatMessage, 'id'> = {
      conversationId,
      from,
      to,
      relatedProperty,
      text,
      timestamp: new Date(),
      isRead: false,
    };

    const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
      ...messageData,
      timestamp: Timestamp.fromDate(messageData.timestamp),
    });

    // Update or create conversation
    await updateConversation(from, to, relatedProperty, text);

    return docRef.id;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};

/**
 * Update or create conversation metadata
 */
const updateConversation = async (
  user1: string,
  user2: string,
  propertyId: string,
  lastMessage: string
) => {
  try {
    const participants = [user1, user2].sort(); // Sort to ensure consistent ID
    const conversationId = `${participants[0]}_${participants[1]}_${propertyId}`;

    // Check if conversation exists
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(conversationsRef, where('id', '==', conversationId));
    const snapshot = await getDocs(q);

    const conversationData = {
      id: conversationId,
      participants,
      propertyId,
      lastMessage,
      lastMessageTime: Timestamp.fromDate(new Date()),
      unreadCount: 1,
    };

    if (snapshot.empty) {
      // Create new conversation
      await addDoc(conversationsRef, conversationData);
    } else {
      // Update existing conversation
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        lastMessage,
        lastMessageTime: Timestamp.fromDate(new Date()),
        unreadCount: (snapshot.docs[0].data().unreadCount || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
  }
};

/**
 * Subscribe to messages for a specific conversation
 */
export const subscribeToMessages = (
  userId: string,
  otherUserId: string,
  propertyId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, CHATS_COLLECTION);
    
    // Generate conversation ID (same logic as when sending)
    const participants = [userId, otherUserId].sort();
    const conversationId = `${participants[0]}_${participants[1]}_${propertyId}`;
    
    // Simple query using conversationId - no complex indexes needed
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            conversationId: data.conversationId || conversationId,
            from: data.from,
            to: data.to,
            relatedProperty: data.relatedProperty,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false,
          };
        });
        callback(messages);
      },
      (error) => {
        console.error('Error subscribing to messages:', error);
        // Return empty array on error instead of breaking
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    return () => {};
  }
};

/**
 * Subscribe to all conversations for a user
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: ChatConversation[]) => void
): (() => void) => {
  try {
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const conversations: ChatConversation[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.id,
            participants: data.participants,
            propertyId: data.propertyId,
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
            unreadCount: data.unreadCount || 0,
            propertyTitle: data.propertyTitle,
            propertyImage: data.propertyImage,
          };
        });
        callback(conversations);
      },
      (error) => {
        console.error('Error subscribing to conversations:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up conversation subscription:', error);
    return () => {};
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  userId: string,
  otherUserId: string,
  propertyId: string
): Promise<void> => {
  try {
    const messagesRef = collection(db, CHATS_COLLECTION);
    
    const q = query(
      messagesRef,
      where('from', '==', otherUserId),
      where('to', '==', userId),
      where('relatedProperty', '==', propertyId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(updatePromises);

    // Update conversation unread count
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const participants = [userId, otherUserId].sort();
    const conversationId = `${participants[0]}_${participants[1]}_${propertyId}`;
    
    const convQuery = query(conversationsRef, where('id', '==', conversationId));
    const convSnapshot = await getDocs(convQuery);
    
    if (!convSnapshot.empty) {
      await updateDoc(convSnapshot.docs[0].ref, { unreadCount: 0 });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Get total unread count for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const messagesRef = collection(db, CHATS_COLLECTION);
    
    const q = query(
      messagesRef,
      where('to', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, CHATS_COLLECTION, messageId);
    await updateDoc(messageRef, { deleted: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
