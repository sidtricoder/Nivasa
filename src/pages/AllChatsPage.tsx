import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, User, Building2, Clock, Loader2, Send, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  subscribeToAllUserChats,
  subscribeToMessages,
  sendChatMessage,
  markMessagesAsRead,
  PropertyChatGroup,
  ChatMessage,
} from '@/services/chatService';
import { getPropertyById } from '@/services/firestoreService';
import { getUserDocument } from '@/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface EnrichedPropertyChatGroup extends PropertyChatGroup {
  propertyTitle: string;
  propertyImage?: string;
}

interface EnrichedConversation {
  otherUserId: string;
  otherUserName: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

const AllChatsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatGroups, setChatGroups] = useState<EnrichedPropertyChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  // Active chat state
  const [activeChat, setActiveChat] = useState<{
    propertyId: string;
    propertyTitle: string;
    otherUserId: string;
    otherUserName: string;
  } | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const unsubscribe = subscribeToAllUserChats(currentUser.uid, async (groups) => {
      // Enrich with property and user data
      const enrichedGroups = await Promise.all(
        groups.map(async (group) => {
          // Fetch property details
          let propertyTitle = 'Property';
          let propertyImage: string | undefined;

          try {
            const property = await getPropertyById(group.propertyId);
            if (property) {
              propertyTitle = property.title;
              propertyImage = property.images[0];
            }
          } catch (error) {
            console.error('Error fetching property:', error);
          }

          // Enrich conversations with user names
          const enrichedConversations = await Promise.all(
            group.conversations.map(async (conv) => {
              let userName = 'User';
              try {
                const userData = await getUserDocument(conv.otherUserId);
                if (userData) {
                  userName = userData.displayName || userData.email || 'User';
                }
              } catch (error) {
                console.error('Error fetching user:', error);
              }

              return {
                ...conv,
                otherUserName: userName,
              };
            })
          );

          return {
            ...group,
            propertyTitle,
            propertyImage,
            conversations: enrichedConversations,
          };
        })
      );

      setChatGroups(enrichedGroups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  // Subscribe to active chat messages
  useEffect(() => {
    if (!currentUser || !activeChat) return;

    const unsubscribe = subscribeToMessages(
      currentUser.uid,
      activeChat.otherUserId,
      activeChat.propertyId,
      (msgs) => {
        // For sellers in AllChatsPage: Filter to only show messages with the selected user
        const filteredMessages = msgs.filter(msg =>
          (msg.from === currentUser.uid && msg.to === activeChat.otherUserId) ||
          (msg.from === activeChat.otherUserId && msg.to === currentUser.uid)
        );
        console.log('Seller chat - filtered to', filteredMessages.length, 'messages with user', activeChat.otherUserId);

        // Mark messages from other user as read
        if (filteredMessages.length > 0) {
          markMessagesAsRead(currentUser.uid, activeChat.otherUserId, activeChat.propertyId);
        }

        setActiveChatMessages(filteredMessages);
      }
    );

    return () => unsubscribe();
  }, [currentUser, activeChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (activeChatMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatMessages.length]);

  // Focus input when chat opens
  useEffect(() => {
    if (activeChat) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeChat]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentUser || !activeChat || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendChatMessage(
        currentUser.uid,
        activeChat.otherUserId,
        activeChat.propertyId,
        messageInput.trim()
      );
      setMessageInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTotalUnread = () => {
    return chatGroups.reduce(
      (total, group) =>
        total +
        group.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
      0
    );
  };

  const handlePropertyClick = (propertyId: string) => {
    setExpandedProperty(expandedProperty === propertyId ? null : propertyId);
  };

  const handleConversationClick = (
    propertyId: string,
    propertyTitle: string,
    otherUserId: string,
    otherUserName: string
  ) => {
    // Open inline chat instead of navigating to property page
    setActiveChat({
      propertyId,
      propertyTitle,
      otherUserId,
      otherUserName,
    });
    setActiveChatMessages([]);
  };

  const closeActiveChat = () => {
    setActiveChat(null);
    setActiveChatMessages([]);
    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Soft flowing gradient background - flowing bottom to top */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(0deg, 
              rgba(210, 200, 220, 0.5) 0%,
              rgba(220, 225, 240, 0.7) 25%,
              rgba(245, 243, 240, 1) 50%,
              rgba(240, 238, 233, 0.9) 75%,
              rgba(230, 210, 220, 0.6) 100%
            )
          `
        }}
      />

      {/* Animated gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Lavender blob - bottom center */}
        <div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(200, 190, 230, 0.6) 0%, rgba(180, 170, 220, 0.3) 50%, transparent 70%)'
          }}
        />

        {/* Warm peach blob - top right */}
        <div
          className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 180, 0.6) 0%, rgba(255, 180, 160, 0.3) 50%, transparent 70%)'
          }}
        />

        {/* Soft blue blob - top left */}
        <div
          className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(180, 200, 240, 0.5) 0%, transparent 60%)'
          }}
        />

        {/* Pink accent blob - right side */}
        <div
          className="absolute top-1/2 -right-20 w-[400px] h-[400px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(230, 200, 220, 0.5) 0%, transparent 60%)'
          }}
        />
      </div>
      <Header />

      <div className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">All Chats</h1>
              <p className="text-muted-foreground mt-1">
                Your property conversations
              </p>
            </div>
            {getTotalUnread() > 0 && (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {getTotalUnread()} unread
              </Badge>
            )}
          </div>

          {chatGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  Start a conversation with property owners or buyers
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {chatGroups.map((group) => {
                const isExpanded = expandedProperty === group.propertyId;
                const propertyUnread = group.conversations.reduce(
                  (sum, conv) => sum + conv.unreadCount,
                  0
                );

                return (
                  <Card key={group.propertyId} className="overflow-hidden">
                    <CardHeader
                      className="cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => handlePropertyClick(group.propertyId)}
                    >
                      <div className="flex items-center gap-4">
                        {group.propertyImage ? (
                          <img
                            src={group.propertyImage}
                            alt={group.propertyTitle}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {group.propertyTitle}
                          </CardTitle>
                          <CardDescription>
                            {group.conversations.length} conversation
                            {group.conversations.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        {propertyUnread > 0 && (
                          <Badge variant="destructive">{propertyUnread}</Badge>
                        )}
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        <div className="space-y-3">
                          {group.conversations.map((conversation) => (
                            <motion.div
                              key={conversation.otherUserId}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleConversationClick(
                                  group.propertyId,
                                  group.propertyTitle,
                                  conversation.otherUserId,
                                  conversation.otherUserName
                                )
                              }
                            >
                              <div className="flex items-start gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold">
                                      {conversation.otherUserName}
                                    </h4>
                                    {conversation.lastMessage && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(
                                          conversation.lastMessage.timestamp
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  {conversation.lastMessage && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {conversation.lastMessage.from ===
                                        currentUser?.uid
                                        ? 'You: '
                                        : ''}
                                      {conversation.lastMessage.text}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {conversation.messages.length} message
                                      {conversation.messages.length !== 1
                                        ? 's'
                                        : ''}
                                    </Badge>
                                    {conversation.unreadCount > 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        {conversation.unreadCount} new
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Inline Chat Panel */}
      <AnimatePresence>
        {activeChat && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center gap-3 shadow-sm">
              <Button variant="ghost" size="icon" onClick={closeActiveChat} className="shrink-0">
                <X className="h-5 w-5" />
              </Button>

              <Avatar className="h-10 w-10 border-2 border-background shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{activeChat.otherUserName}</h3>
                <p className="text-xs text-muted-foreground truncate">{activeChat.propertyTitle}</p>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-muted/30">
              <div className="space-y-4">
                {activeChatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  activeChatMessages.map((msg) => {
                    const isOwn = msg.from === currentUser?.uid;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        {!isOwn && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-primary/10">
                              {activeChat.otherUserName[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 shadow-sm ${isOwn
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-card border rounded-tl-sm'
                              }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                              {msg.text}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {format(msg.timestamp, 'h:mm a')}
                          </span>
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
                <Textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 resize-none min-h-[44px] max-h-[120px]"
                  rows={1}
                  disabled={sendingMessage}
                  style={{
                    height: 'auto',
                    minHeight: '44px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when chat is open */}
      <AnimatePresence>
        {activeChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeActiveChat}
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AllChatsPage;
