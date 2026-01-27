import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessageStore } from '@/stores/messageStore';
import { cn } from '@/lib/utils';

interface InboxButtonProps {
  className?: string;
}

const InboxButton: React.FC<InboxButtonProps> = ({ className }) => {
  const { unreadTotal, setChatOpen } = useMessageStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setChatOpen(true)}
      className={cn('relative', className)}
      aria-label={`Messages${unreadTotal > 0 ? ` (${unreadTotal} unread)` : ''}`}
    >
      <MessageCircle className="h-5 w-5" />
      
      <AnimatePresence>
        {unreadTotal > 0 && (
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
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Notification dot pulse */}
      <AnimatePresence>
        {unreadTotal > 0 && (
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
  );
};

export default InboxButton;
