import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, ArrowUpRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchStore, type RecentSearch } from '@/stores/searchStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RecentSearchesProps {
  onSelect: (search: RecentSearch) => void;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({
  onSelect,
  className,
  isOpen,
  onClose,
}) => {
  const { recentSearches, clearRecentSearches } = useSearchStore();

  if (!isOpen || recentSearches.length === 0) return null;

  const formatFilters = (filters: Partial<typeof recentSearches[0]['filters']>) => {
    const parts: string[] = [];
    if (filters.bhk && filters.bhk.length > 0) {
      parts.push(`${filters.bhk.join(', ')} BHK`);
    }
    if (filters.localities && filters.localities.length > 0) {
      parts.push(filters.localities.slice(0, 2).join(', '));
    }
    return parts.join(' • ');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'absolute top-full left-0 right-0 mt-2 z-50',
          'bg-card border border-border rounded-lg shadow-xl',
          'overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recent Searches
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearRecentSearches();
              onClose();
            }}
            className="text-xs text-muted-foreground hover:text-foreground h-auto py-1 px-2"
          >
            Clear All
          </Button>
        </div>

        {/* Search List */}
        <ScrollArea className="max-h-[280px]">
          <div className="py-1">
            {recentSearches.map((search, index) => (
              <motion.button
                key={search.id}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(search);
                  onClose();
                }}
                className={cn(
                  'w-full px-4 py-3 flex items-center gap-3',
                  'hover:bg-secondary/50 transition-colors text-left',
                  'group'
                )}
              >
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {search.query || 'All Properties'}
                  </p>
                  {formatFilters(search.filters) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {formatFilters(search.filters)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(search.timestamp), { addSuffix: true })}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecentSearches;
