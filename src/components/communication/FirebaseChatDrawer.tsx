import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  MessageCircle,
  CheckCheck,
  Search,
  Home,
  Smile,
  Paperclip,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  sendChatMessage,
  subscribeToMessages,
  subscribeToConversations,
  markMessagesAsRead,
  type ChatMessage,
  type ChatConversation,
} from '@/services/chatService';

interface FirebaseChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId?: string;
  propertyId?: string;
  sellerId?: string;
  sellerName?: string;
  propertyTitle?: string;
}

const FirebaseChatDrawer: React.FC<FirebaseChatDrawerProps> = ({
  isOpen,
  onClose,
  activeConversationId,
  propertyId,
  sellerId,
  sellerName,
  propertyTitle,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  
  // If propertyId is provided, we're in direct chat mode
  const isDirectChat = !!(propertyId && sellerId);
  
  // Check if current user is the seller of this property
  const isSeller = currentUser?.uid === sellerId;

  // Subscribe to ALL messages for the property when in direct chat mode
  useEffect(() => {
    if (!currentUser || !isOpen || !propertyId) return;

    console.log('Subscribing to ALL messages for property:', propertyId);
    const unsubscribe = subscribeToMessages(
      currentUser.uid,
      sellerId || currentUser.uid, // fallback to self
      propertyId,
      (msgs) => {
        console.log('Received ALL messages:', msgs.length);
        
        // FILTER MESSAGES BASED ON USER ROLE:
        // For BUYERS: Only show messages between buyer and seller
        // For SELLERS: Show all messages (they see all conversations)
        let filteredMessages = msgs;
        
        if (!isSeller && sellerId) {
          // Buyer: Filter to only show messages between current user and seller
          filteredMessages = msgs.filter(msg => 
            (msg.from === currentUser.uid && msg.to === sellerId) ||
            (msg.from === sellerId && msg.to === currentUser.uid)
          );
          console.log('Buyer view - filtered to', filteredMessages.length, 'messages with seller');
          
          // Mark messages from seller as read
          if (filteredMessages.length > 0) {
            markMessagesAsRead(currentUser.uid, sellerId, propertyId);
          }
        } else {
          console.log('Seller view - showing all', msgs.length, 'messages');
        }
        
        setMessages(filteredMessages);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isOpen, propertyId, sellerId, isSeller]);

  // Subscribe to conversations (for conversation list view)
  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const unsubscribe = subscribeToConversations(
      currentUser.uid,
      (convs) => {
        console.log('Received conversations:', convs.length);
        setConversations(convs);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isDirectChat && isOpen) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 300);
    }
  }, [isDirectChat, isOpen]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentUser || !propertyId || !sellerId) return;

    try {
      await sendChatMessage(
        currentUser.uid,
        sellerId,
        propertyId,
        messageInput.trim()
      );
      setMessageInput('');
      // Re-focus the input after sending
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 50);
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatMessageTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const formatConversationDate = (date: Date) => {
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Conversation List View
  const ConversationListView = () => (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b bg-card">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start chatting with property sellers to inquire about listings
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conv) => {
              const otherUserId = conv.participants.find((p) => p !== currentUser?.uid);
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    // For now just close - navigating to property chat should happen through property page
                    console.log('Selected conversation:', conv);
                  }}
                  className="w-full p-4 hover:bg-accent transition-colors text-left relative group"
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-background">
                        <AvatarImage src={conv.propertyImage} />
                        <AvatarFallback className="bg-primary/10">
                          <Home className="h-6 w-6 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-medium">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="font-semibold text-base truncate">{conv.propertyTitle}</h4>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatConversationDate(conv.lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // Chat View
  const ChatView = () => (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b bg-card flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-11 w-11 border-2 border-background shrink-0">
          <AvatarFallback className="bg-primary/10">
            <Home className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{sellerName || 'Chat'}</h3>
          <p className="text-xs text-muted-foreground truncate">{propertyTitle || 'Property'}</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-muted/30">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = msg.from === currentUser?.uid;
              const showAvatar =
                index === 0 || messages[index - 1].from !== msg.from;
              const isLastInGroup =
                index === messages.length - 1 ||
                messages[index + 1].from !== msg.from;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
                >
                  {showAvatar && !isOwn ? (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {sellerName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    !isOwn && <div className="w-8 flex-shrink-0" />
                  )}

                  <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-card border rounded-tl-sm',
                        !isLastInGroup && isOwn && 'rounded-br-2xl',
                        !isLastInGroup && !isOwn && 'rounded-bl-2xl'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1 px-1',
                        isOwn ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                      {isOwn && (
                        <CheckCheck
                          className={cn(
                            'h-3.5 w-3.5',
                            msg.isRead ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              ref={messageInputRef}
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="pr-10 resize-none bg-background min-h-[44px]"
              autoFocus
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <AnimatePresence mode="wait">
          {isDirectChat ? (
            <motion.div
              key="chat"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="h-full"
            >
              <ChatView />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="h-full"
            >
              <ConversationListView />
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

export default FirebaseChatDrawer;
