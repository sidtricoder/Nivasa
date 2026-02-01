import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  ariaLabel?: string;
  link: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SocialItem {
  label: string;
  link: string;
}

interface StaggeredMenuProps {
  position?: 'left' | 'right';
  items: MenuItem[];
  socialItems?: SocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  changeMenuColorOnOpen?: boolean;
  colors?: [string, string];
  logoUrl?: string;
  accentColor?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  buttonContainer?: string;
}

const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  items,
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = false,
  menuButtonColor = '#000000',
  openMenuButtonColor = '#ffffff',
  changeMenuColorOnOpen = true,
  colors = ['#667eea', '#764ba2'],
  logoUrl,
  accentColor = '#667eea',
  onMenuOpen,
  onMenuClose,
  buttonContainer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (buttonContainer) {
      setContainer(document.getElementById(buttonContainer));
    }
  }, [buttonContainer]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen && onMenuOpen) {
      onMenuOpen();
    } else if (isOpen && onMenuClose) {
      onMenuClose();
    }
  };

  const menuVariants = {
    closed: {
      x: position === 'right' ? '100%' : '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: position === 'right' ? 50 : -50 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    }),
  };

  return ReactDOM.createPortal(
    <>
      {/* Menu Button */}
      {container ? (
        ReactDOM.createPortal(
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-110 relative"
            style={{
              backgroundColor: isOpen && changeMenuColorOnOpen ? openMenuButtonColor : menuButtonColor,
              color: isOpen && changeMenuColorOnOpen ? menuButtonColor : openMenuButtonColor,
              zIndex: 9999,
            }}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>,
          container
        )
      ) : (
        <button
          onClick={toggleMenu}
          className="fixed top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          style={{
            backgroundColor: isOpen && changeMenuColorOnOpen ? openMenuButtonColor : menuButtonColor,
            color: isOpen && changeMenuColorOnOpen ? menuButtonColor : openMenuButtonColor,
            zIndex: 9999,
          }}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 9997 }}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              'fixed top-0 bottom-0 w-full sm:w-96 shadow-2xl overflow-y-auto',
              position === 'right' ? 'right-0' : 'left-0'
            )}
            style={{
              background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
              zIndex: 9998,
            }}
          >
            <div className="flex flex-col h-full p-8 text-white">
              {logoUrl && (
                <div className="mb-12">
                  <img src={logoUrl} alt="Logo" className="h-12" />
                </div>
              )}

              {/* Menu Items */}
              <nav className="flex-1 space-y-2">
                {items.map((item, i) => (
                  <motion.div
                    key={item.label}
                    custom={i}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <Link
                      to={item.link}
                      onClick={toggleMenu}
                      className="group flex items-center gap-4 py-4 px-4 rounded-lg hover:bg-white/10 transition-all duration-300"
                      aria-label={item.ariaLabel || item.label}
                    >
                      {displayItemNumbering && (
                        <span
                          className="text-sm font-mono opacity-50"
                          style={{ color: accentColor }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span className="text-2xl font-bold group-hover:translate-x-2 transition-transform duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Social Links */}
              {displaySocials && socialItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: items.length * 0.05 + 0.1 }}
                  className="pt-8 border-t border-white/20"
                >
                  <div className="flex gap-4">
                    {socialItems.map((social) => (
                      <a
                        key={social.label}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:opacity-70 transition-opacity"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

export default StaggeredMenu;
