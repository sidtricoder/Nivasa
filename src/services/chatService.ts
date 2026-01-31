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
      console.log('Creating new conversation:', conversationId);
      await addDoc(conversationsRef, conversationData);
    } else {
      // Update existing conversation - include participants to ensure permissions check passes
      const docRef = snapshot.docs[0].ref;
      console.log('Updating existing conversation:', conversationId);
      await updateDoc(docRef, {
        participants, // Include participants in update to satisfy Firestore rules
        lastMessage,
        lastMessageTime: Timestamp.fromDate(new Date()),
        unreadCount: (snapshot.docs[0].data().unreadCount || 0) + 1,
      });
    }
    console.log('Conversation updated successfully');
  } catch (error: any) {
    console.error('Error updating conversation:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    // Don't throw - allow message to be sent even if conversation metadata fails
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
    
    console.log('Subscribing to messages:', { userId, otherUserId, propertyId, conversationId });
    
    // Simple query: get all messages for this property, filter client-side
    // This avoids complex index requirements
    const q = query(
      messagesRef,
      where('relatedProperty', '==', propertyId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Got snapshot with', snapshot.docs.length, 'total messages for property');
        
        const allPropertyMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            conversationId: data.conversationId || '',
            from: data.from,
            to: data.to,
            relatedProperty: data.relatedProperty,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false,
          };
        });
        
        // Filter to only messages between these two users
        const filteredMessages = allPropertyMessages.filter(msg => 
          (msg.from === userId && msg.to === otherUserId) ||
          (msg.from === otherUserId && msg.to === userId)
        );
        
        console.log('Filtered to', filteredMessages.length, 'messages for this conversation');
        
        callback(filteredMessages);
      },
      (error) => {
        console.error('Error subscribing to messages:', error);
        // Try a simpler query without orderBy if index is missing
        const simpleQuery = query(
          messagesRef,
          where('relatedProperty', '==', propertyId)
        );
        
        const fallbackUnsub = onSnapshot(
          simpleQuery,
          (snapshot) => {
            const allPropertyMessages = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                conversationId: data.conversationId || '',
                from: data.from,
                to: data.to,
                relatedProperty: data.relatedProperty,
                text: data.text,
                timestamp: data.timestamp?.toDate() || new Date(),
                isRead: data.isRead || false,
              };
            });
            
            const filteredMessages = allPropertyMessages
              .filter(msg => 
                (msg.from === userId && msg.to === otherUserId) ||
                (msg.from === otherUserId && msg.to === userId)
              )
              .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            
            callback(filteredMessages);
          },
          (err) => {
            console.error('Fallback query also failed:', err);
            callback([]);
          }
        );
        
        // Note: This creates a new subscription, but the outer one failed anyway
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
        console.log('Conversations snapshot received:', snapshot.docs.length, 'documents');
        const conversations: ChatConversation[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Conversation data:', data);
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
        console.log('Parsed conversations:', conversations);
        callback(conversations);
      },
      (error) => {
        console.error('Error subscribing to conversations:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
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

/**
 * Get all chats for the current user, grouped by property
 */
export interface PropertyChatGroup {
  propertyId: string;
  propertyTitle?: string;
  conversations: {
    otherUserId: string;
    otherUserName?: string;
    messages: ChatMessage[];
    lastMessage: ChatMessage | null;
    unreadCount: number;
  }[];
}

export const getAllUserChatsGroupedByProperty = async (
  userId: string
): Promise<PropertyChatGroup[]> => {
  try {
    const messagesRef = collection(db, CHATS_COLLECTION);
    
    // Query for messages where user is sender
    const sentQuery = query(
      messagesRef,
      where('from', '==', userId)
    );
    
    // Query for messages where user is receiver
    const receivedQuery = query(
      messagesRef,
      where('to', '==', userId)
    );
    
    // Execute both queries
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);
    
    // Combine all messages
    const allMessages: ChatMessage[] = [
      ...sentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId || '',
          from: data.from,
          to: data.to,
          relatedProperty: data.relatedProperty,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead || false,
        };
      }),
      ...receivedSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId || '',
          from: data.from,
          to: data.to,
          relatedProperty: data.relatedProperty,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead || false,
        };
      })
    ];
    
    // Group messages by property and conversation
    const propertyGroups = new Map<string, Map<string, ChatMessage[]>>();
    
    allMessages.forEach(message => {
      // Determine the other user in the conversation
      const otherUserId = message.from === userId ? message.to : message.from;
      
      // Get or create property group
      if (!propertyGroups.has(message.relatedProperty)) {
        propertyGroups.set(message.relatedProperty, new Map());
      }
      
      const propertyConversations = propertyGroups.get(message.relatedProperty)!;
      
      // Get or create conversation with this user
      if (!propertyConversations.has(otherUserId)) {
        propertyConversations.set(otherUserId, []);
      }
      
      propertyConversations.get(otherUserId)!.push(message);
    });
    
    // Convert to array format and sort messages
    const result: PropertyChatGroup[] = [];
    
    propertyGroups.forEach((conversations, propertyId) => {
      const conversationsArray = Array.from(conversations.entries()).map(([otherUserId, messages]) => {
        // Sort messages by timestamp
        const sortedMessages = messages.sort((a, b) => 
          a.timestamp.getTime() - b.timestamp.getTime()
        );
        
        // Calculate unread count (messages sent to current user that are unread)
        const unreadCount = sortedMessages.filter(
          msg => msg.to === userId && !msg.isRead
        ).length;
        
        return {
          otherUserId,
          messages: sortedMessages,
          lastMessage: sortedMessages[sortedMessages.length - 1] || null,
          unreadCount,
        };
      });
      
      // Sort conversations by last message time (most recent first)
      conversationsArray.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp.getTime() || 0;
        const timeB = b.lastMessage?.timestamp.getTime() || 0;
        return timeB - timeA;
      });
      
      result.push({
        propertyId,
        conversations: conversationsArray,
      });
    });
    
    // Sort property groups by most recent activity
    result.sort((a, b) => {
      const lastTimeA = a.conversations[0]?.lastMessage?.timestamp.getTime() || 0;
      const lastTimeB = b.conversations[0]?.lastMessage?.timestamp.getTime() || 0;
      return lastTimeB - lastTimeA;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

/**
 * Subscribe to all chats for the current user in real-time
 */
export const subscribeToAllUserChats = (
  userId: string,
  callback: (chats: PropertyChatGroup[]) => void
): (() => void) => {
  try {
    const messagesRef = collection(db, CHATS_COLLECTION);
    
    // Create queries for both sent and received messages
    const sentQuery = query(
      messagesRef,
      where('from', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const receivedQuery = query(
      messagesRef,
      where('to', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    let sentMessages: ChatMessage[] = [];
    let receivedMessages: ChatMessage[] = [];
    
    const processMessages = () => {
      const allMessages = [...sentMessages, ...receivedMessages];
      
      // Group by property and conversation
      const propertyGroups = new Map<string, Map<string, ChatMessage[]>>();
      
      allMessages.forEach(message => {
        const otherUserId = message.from === userId ? message.to : message.from;
        
        if (!propertyGroups.has(message.relatedProperty)) {
          propertyGroups.set(message.relatedProperty, new Map());
        }
        
        const propertyConversations = propertyGroups.get(message.relatedProperty)!;
        
        if (!propertyConversations.has(otherUserId)) {
          propertyConversations.set(otherUserId, []);
        }
        
        propertyConversations.get(otherUserId)!.push(message);
      });
      
      // Convert to result format
      const result: PropertyChatGroup[] = [];
      
      propertyGroups.forEach((conversations, propertyId) => {
        const conversationsArray = Array.from(conversations.entries()).map(([otherUserId, messages]) => {
          const sortedMessages = messages.sort((a, b) => 
            a.timestamp.getTime() - b.timestamp.getTime()
          );
          
          const unreadCount = sortedMessages.filter(
            msg => msg.to === userId && !msg.isRead
          ).length;
          
          return {
            otherUserId,
            messages: sortedMessages,
            lastMessage: sortedMessages[sortedMessages.length - 1] || null,
            unreadCount,
          };
        });
        
        conversationsArray.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp.getTime() || 0;
          const timeB = b.lastMessage?.timestamp.getTime() || 0;
          return timeB - timeA;
        });
        
        result.push({
          propertyId,
          conversations: conversationsArray,
        });
      });
      
      result.sort((a, b) => {
        const lastTimeA = a.conversations[0]?.lastMessage?.timestamp.getTime() || 0;
        const lastTimeB = b.conversations[0]?.lastMessage?.timestamp.getTime() || 0;
        return lastTimeB - lastTimeA;
      });
      
      callback(result);
    };
    
    // Subscribe to sent messages
    const unsubscribeSent = onSnapshot(
      sentQuery,
      (snapshot) => {
        sentMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            conversationId: data.conversationId || '',
            from: data.from,
            to: data.to,
            relatedProperty: data.relatedProperty,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false,
          };
        });
        processMessages();
      },
      (error) => {
        console.error('Error in sent messages subscription:', error);
      }
    );
    
    // Subscribe to received messages
    const unsubscribeReceived = onSnapshot(
      receivedQuery,
      (snapshot) => {
        receivedMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            conversationId: data.conversationId || '',
            from: data.from,
            to: data.to,
            relatedProperty: data.relatedProperty,
            text: data.text,
            timestamp: data.timestamp?.toDate() || new Date(),
            isRead: data.isRead || false,
          };
        });
        processMessages();
      },
      (error) => {
        console.error('Error in received messages subscription:', error);
      }
    );
    
    // Return combined unsubscribe function
    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    return () => {};
  }
};
