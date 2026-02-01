import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for messaging - syncs with Firebase Firestore
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  property_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  // Additional fields for UI
  unreadCount: number;
  otherPartyName: string;
  otherPartyAvatar?: string;
  propertyTitle: string;
  propertyImage?: string;
}

interface MessageState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // Keyed by conversation_id
  activeConversation: string | null;
  isChatOpen: boolean;
  unreadTotal: number;
  currentUserId: string;

  // Actions
  setActiveConversation: (conversationId: string | null) => void;
  setChatOpen: (open: boolean) => void;
  sendMessage: (conversationId: string, content: string) => void;
  startConversation: (
    sellerId: string,
    sellerName: string,
    propertyId: string,
    propertyTitle: string,
    propertyImage?: string
  ) => string;
  markAsRead: (conversationId: string) => void;
  addSimulatedReply: (conversationId: string, content: string) => void;
}

// Generate a stable user ID
const getUserId = (): string => {
  const key = 'roomgi_user_id';
  let userId = localStorage.getItem(key);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, userId);
  }
  return userId;
};

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversation: null,
      isChatOpen: false,
      unreadTotal: 0,
      currentUserId: getUserId(),

      setActiveConversation: (conversationId) => {
        set({ activeConversation: conversationId });
        if (conversationId) {
          get().markAsRead(conversationId);
        }
      },

      setChatOpen: (open) => {
        set({ isChatOpen: open });
        if (!open) {
          set({ activeConversation: null });
        }
      },

      sendMessage: (conversationId, content) => {
        const { currentUserId, conversations, messages } = get();
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        const newMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          conversation_id: conversationId,
          sender_id: currentUserId,
          receiver_id: conversation.seller_id === currentUserId 
            ? conversation.buyer_id 
            : conversation.seller_id,
          property_id: conversation.property_id,
          content,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        const conversationMessages = messages[conversationId] || [];
        
        set({
          messages: {
            ...messages,
            [conversationId]: [...conversationMessages, newMessage],
          },
          conversations: conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  last_message: content,
                  last_message_at: newMessage.created_at,
                }
              : c
          ),
        });

        // Simulate seller reply after 2-5 seconds
        const replyDelay = 2000 + Math.random() * 3000;
        setTimeout(() => {
          get().addSimulatedReply(conversationId, getSellerReply(content));
        }, replyDelay);
      },

      startConversation: (sellerId, sellerName, propertyId, propertyTitle, propertyImage) => {
        const { conversations, currentUserId } = get();

        // Check if conversation already exists
        const existing = conversations.find(
          (c) => c.property_id === propertyId && c.seller_id === sellerId
        );
        if (existing) {
          set({ activeConversation: existing.id, isChatOpen: true });
          return existing.id;
        }

        // Create new conversation
        const newConversation: Conversation = {
          id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          property_id: propertyId,
          buyer_id: currentUserId,
          seller_id: sellerId,
          last_message: null,
          last_message_at: null,
          created_at: new Date().toISOString(),
          unreadCount: 0,
          otherPartyName: sellerName,
          propertyTitle,
          propertyImage,
        };

        set({
          conversations: [newConversation, ...conversations],
          activeConversation: newConversation.id,
          isChatOpen: true,
          messages: {
            ...get().messages,
            [newConversation.id]: [],
          },
        });

        return newConversation.id;
      },

      markAsRead: (conversationId) => {
        const { conversations, messages, currentUserId } = get();
        
        // Mark all messages in conversation as read
        const conversationMessages = messages[conversationId] || [];
        const updatedMessages = conversationMessages.map((m) =>
          m.receiver_id === currentUserId && !m.is_read
            ? { ...m, is_read: true }
            : m
        );

        const unreadInConversation = conversations.find((c) => c.id === conversationId)?.unreadCount || 0;

        set({
          messages: {
            ...messages,
            [conversationId]: updatedMessages,
          },
          conversations: conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
          unreadTotal: Math.max(0, get().unreadTotal - unreadInConversation),
        });
      },

      addSimulatedReply: (conversationId, content) => {
        const { conversations, messages, currentUserId } = get();
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        const replyMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          conversation_id: conversationId,
          sender_id: conversation.seller_id,
          receiver_id: currentUserId,
          property_id: conversation.property_id,
          content,
          is_read: get().activeConversation === conversationId,
          created_at: new Date().toISOString(),
        };

        const conversationMessages = messages[conversationId] || [];
        const isCurrentlyViewing = get().activeConversation === conversationId;

        set({
          messages: {
            ...messages,
            [conversationId]: [...conversationMessages, replyMessage],
          },
          conversations: conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  last_message: content,
                  last_message_at: replyMessage.created_at,
                  unreadCount: isCurrentlyViewing ? c.unreadCount : c.unreadCount + 1,
                }
              : c
          ),
          unreadTotal: isCurrentlyViewing ? get().unreadTotal : get().unreadTotal + 1,
        });
      },
    }),
    {
      name: 'roomgi-messages',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        currentUserId: state.currentUserId,
        unreadTotal: state.unreadTotal,
      }),
    }
  )
);

// Helper function to generate seller replies
function getSellerReply(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('₹')) {
    return "Thank you for your interest! The price is negotiable for genuine buyers. Would you like to schedule a visit to see the property?";
  }
  
  if (lowerMessage.includes('visit') || lowerMessage.includes('see') || lowerMessage.includes('view')) {
    return "Great! I'm available this weekend for property visits. What time works best for you - morning or afternoon?";
  }
  
  if (lowerMessage.includes('available') || lowerMessage.includes('when')) {
    return "The property is available for immediate possession. I can arrange a visit at your convenience. When would you like to come?";
  }
  
  if (lowerMessage.includes('document') || lowerMessage.includes('paper')) {
    return "All documents are in order - RERA registered, clear title, and no legal issues. I can share the details during your visit.";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('interested')) {
    return "Hello! Thank you for reaching out. I'd be happy to help you with any questions about this property. What would you like to know?";
  }
  
  // Default reply
  const defaultReplies = [
    "Thank you for your message! I'll get back to you shortly with more details.",
    "Thanks for your interest! Would you like to schedule a property visit?",
    "I appreciate your inquiry. Let me know if you have any specific questions about the property.",
    "Thank you! This is a great property in a prime location. Happy to share more details if you'd like.",
  ];
  
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}

// Export for external use
export const getCurrentUserId = () => getUserId();
