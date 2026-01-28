import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/services/chatService';
import FirebaseChatDrawer from './FirebaseChatDrawer';

interface InboxButtonProps {
  className?: string;
}

const InboxButton: React.FC<InboxButtonProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Poll for unread count
  useEffect(() => {
    if (!currentUser) return;

    const fetchUnreadCount = async () => {
      const count = await getUnreadCount(currentUser.uid);
      setUnreadCount(count);
    };

    fetchUnreadCount();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsChatOpen(true)}
        className={cn('relative', className)}
        aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <MessageCircle className="h-5 w-5" />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center',
                'min-w-5 h-5 px-1.5 rounded-full',
                'bg-destructive text-destructive-foreground text-xs font-medium'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Notification dot pulse */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1"
            >
              <span className="flex h-3 w-3">
                <motion.span
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.75, 0, 0.75],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inline-flex h-full w-full rounded-full bg-destructive"
                />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <FirebaseChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default InboxButton;
