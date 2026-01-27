import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  ArrowLeft,
  MessageCircle,
  Check,
  CheckCheck,
  Search,
  Home,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMessageStore, type Conversation, type Message } from '@/stores/messageStore';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

const ChatDrawer: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversation,
    isChatOpen,
    currentUserId,
    setActiveConversation,
    setChatOpen,
    sendMessage,
  } = useMessageStore();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find active conversation details
  const activeConv = conversations.find((c) => c.id === activeConversation);
  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeConversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeMessages.length, activeConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;
    sendMessage(activeConversation, messageInput.trim());
    setMessageInput('');
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };

  const formatConversationDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherPartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Conversation List View
  const ConversationListView = () => (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Separator />

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No conversations yet</h3>
            <p className="text-sm text-muted-foreground">
              Start a conversation by clicking "Chat with Seller" on any property
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conv) => (
              <motion.button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                whileHover={{ backgroundColor: 'hsl(var(--secondary) / 0.5)' }}
                className="w-full p-4 flex items-start gap-3 text-left transition-colors"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  {conv.propertyImage ? (
                    <AvatarImage src={conv.propertyImage} alt={conv.propertyTitle} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Home className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground truncate">
                      {conv.otherPartyName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatConversationDate(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.propertyTitle}
                  </p>
                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5 opacity-75">
                      {conv.last_message}
                    </p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // Chat View
  const ChatView = () => (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveConversation(null)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 shrink-0">
          {activeConv?.propertyImage ? (
            <AvatarImage src={activeConv.propertyImage} alt={activeConv.propertyTitle} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            <Home className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">
            {activeConv?.otherPartyName}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {activeConv?.propertyTitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {activeMessages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message
              </p>
            </div>
          )}
          {activeMessages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.2) }}
                className={cn(
                  'flex',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5',
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                  <div
                    className={cn(
                      'flex items-center justify-end gap-1 mt-1',
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    <span className="text-[10px]">
                      {formatMessageTime(message.created_at)}
                    </span>
                    {isOwn && (
                      message.is_read ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageInput.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <Sheet open={isChatOpen} onOpenChange={(open) => !open && setChatOpen(false)}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Messages
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            {activeConversation ? (
              <motion.div
                key="chat"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ChatView />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ConversationListView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatDrawer;
