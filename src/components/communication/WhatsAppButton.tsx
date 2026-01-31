import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phoneNumber: string;
  propertyTitle: string;
  propertyPrice: string;
  propertyLocation: string;
  className?: string;
  variant?: 'floating' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  propertyTitle,
  propertyPrice,
  propertyLocation,
  className,
  variant = 'floating',
  size = 'md',
}) => {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

  // Create pre-filled message
  const message = encodeURIComponent(
    `Hi! I'm interested in your property:\n\n` +
    `🏠 ${propertyTitle}\n` +
    `💰 ${propertyPrice}\n` +
    `📍 ${propertyLocation}\n\n` +
    `I found this listing on RoomGi. Could you please share more details?`
  );

  // WhatsApp URL (works on both mobile and web)
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${message}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  if (variant === 'inline') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
          'bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium',
          'transition-colors duration-200 shadow-md hover:shadow-lg min-h-[48px]',
          className
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconSizes[size]}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span>Chat on WhatsApp</span>
      </motion.button>
    );
  }

  // Floating variant
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          className
        )}
      >
        {/* Pulse animation ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#25D366]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main button */}
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative flex items-center justify-center rounded-full',
            'bg-[#25D366] hover:bg-[#20BD5A] text-white',
            'shadow-lg hover:shadow-xl transition-all duration-300',
            sizeClasses[size]
          )}
          aria-label="Chat on WhatsApp"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={iconSizes[size]}
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </motion.button>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
        >
          <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
            <p className="text-sm font-medium text-foreground">Chat with Seller</p>
            <p className="text-xs text-muted-foreground">Quick response on WhatsApp</p>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            <div className="border-8 border-transparent border-l-border" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WhatsAppButton;
