import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  BookmarkPlus,
  Bell,
  BellOff,
  Trash2,
  Filter,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useSearchStore, type SearchFilters, type SavedSearch } from '@/stores/searchStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SavedSearchesProps {
  currentFilters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  className?: string;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({
  currentFilters,
  onApply,
  className,
}) => {
  const { savedSearches, saveSearch, deleteSavedSearch, toggleSearchAlert } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast.error('Please enter a name for your search');
      return;
    }

    saveSearch(searchName.trim(), currentFilters);
    toast.success('Search saved successfully!');
    setSearchName('');
    setIsSaveDialogOpen(false);
  };

  const handleDeleteSearch = (id: string, name: string) => {
    deleteSavedSearch(id);
    toast.success(`"${name}" removed from saved searches`);
  };

  const formatFilters = (filters: SearchFilters) => {
    const parts: string[] = [];
    if (filters.query) parts.push(`"${filters.query}"`);
    if (filters.bhk.length > 0) parts.push(`${filters.bhk.join(', ')} BHK`);
    if (filters.localities.length > 0) {
      parts.push(filters.localities.slice(0, 2).join(', '));
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000) {
      parts.push(`₹${(filters.priceRange[0] / 100000).toFixed(0)}L - ₹${(filters.priceRange[1] / 10000000).toFixed(1)}Cr`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'All Properties';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Save Current Search Button */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <BookmarkPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Save Search</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save This Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., 3BHK in Koramangala"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveSearch();
                  }
                }}
              />
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">
                Current Filters: {formatFilters(currentFilters)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveSearch}>
              <Check className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Saved Searches Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 relative">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
            {savedSearches.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {savedSearches.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              Saved Searches
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] -mx-6 px-6">
            {savedSearches.length === 0 ? (
              <div className="py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No saved searches yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save your searches to quickly access them later
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search, index) => (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {search.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {formatFilters(search.filters)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Saved {format(new Date(search.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleSearchAlert(search.id)}
                          title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
                        >
                          {search.alertEnabled ? (
                            <Bell className="h-4 w-4 text-primary" />
                          ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSearch(search.id, search.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        onApply(search.filters);
                        setIsOpen(false);
                        toast.success(`Applied "${search.name}" filters`);
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Apply This Search
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedSearches;
