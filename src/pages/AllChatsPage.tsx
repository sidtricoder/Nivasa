import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Building2, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  subscribeToAllUserChats,
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
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
  const [chatGroups, setChatGroups] = useState<EnrichedPropertyChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

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

  const handleConversationClick = (propertyId: string, otherUserId: string) => {
    navigate(`/property/${propertyId}?chat=${otherUserId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                                  conversation.otherUserId
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

      <Footer />
    </div>
  );
};

export default AllChatsPage;
