import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Property } from '@/data/listings';
import { sendPropertyChatMessage, quickSuggestions, ChatMessage, ChatResponse } from '@/services/propertyChatService';
import { saveAIPropertyChat, getAIPropertyChat, AIChatMessage } from '@/services/firestoreService';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyChatbotProps {
  property: Property;
}

const PropertyChatbot: React.FC<PropertyChatbotProps> = ({ property }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create a stable session ID based on user or use localStorage for anonymous users
  const sessionId = useMemo(() => {
    if (currentUser?.uid) {
      return currentUser.uid;
    }
    // For anonymous users, use a session from localStorage
    const storageKey = `ai_chat_session_${property.id}`;
    let existingSession = localStorage.getItem(storageKey);
    if (!existingSession) {
      existingSession = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, existingSession);
    }
    return existingSession;
  }, [currentUser?.uid, property.id]);

  // Load previous chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const existingChat = await getAIPropertyChat(property.id, sessionId);
        if (existingChat && existingChat.messages.length > 0) {
          // Convert timestamps to ChatMessage format
          const loadedMessages: ChatMessage[] = existingChat.messages.map(m => ({
            role: m.role,
            content: m.content
          }));
          setMessages(loadedMessages);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [property.id, sessionId]);

  // Save chat to Firebase whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;

    const saveChat = async () => {
      const messagesWithTimestamp: AIChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      }));

      await saveAIPropertyChat({
        propertyId: property.id,
        propertyTitle: property.title,
        userId: currentUser?.uid,
        sessionId,
        messages: messagesWithTimestamp
      });
    };

    saveChat();
  }, [messages, property.id, property.title, currentUser?.uid, sessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setInputValue('');
    setShowSuggestions(false);
    setFollowUpSuggestions([]); // Clear previous suggestions

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Get AI response
      const response = await sendPropertyChatMessage(property, userMessage, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
      setFollowUpSuggestions(response.followUpSuggestions);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble responding right now. Please try again."
      }]);
      setFollowUpSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (query: string) => {
    handleSendMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="rounded-full h-14 px-5 shadow-lg gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Sparkles className="h-5 w-5" />
              Ask AI
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl border bg-background overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Property Assistant</h3>
                  <p className="text-xs text-white/80">Powered by AI</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="h-[350px] p-4">
              {/* Loading history indicator */}
              {isLoadingHistory && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {/* Welcome Message */}
              {!isLoadingHistory && messages.length === 0 && (
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground mb-1">Hi! I'm your property assistant</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me anything about this property!
                  </p>
                </div>
              )}

              {/* Quick Suggestions */}
              {showSuggestions && !isLoadingHistory && messages.length === 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {quickSuggestions.slice(0, 6).map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors py-1.5 px-3"
                      onClick={() => handleQuickSuggestion(suggestion.query)}
                    >
                      {suggestion.label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Chat Messages */}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-md'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Follow-up Suggestions */}
                {!isLoading && followUpSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 mt-3"
                  >
                    {followUpSuggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors py-1.5 px-3 text-xs"
                        onClick={() => handleQuickSuggestion(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about this property..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                  className="shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                AI responses are based on property data. For specific inquiries, contact the seller.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyChatbot;
