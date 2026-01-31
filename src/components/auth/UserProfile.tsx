import { useAuth } from '@/contexts/AuthContext';
import { signOut as firebaseSignOut } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/contexts/FavoritesContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Heart, Building2, Eye, History } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

export const UserProfile = () => {
  const { currentUser, userData, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { favorites } = useFavorites();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (!currentUser) {
    return <AuthDialog />;
  }

  const displayName = userData?.displayName || currentUser.email || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userData?.photoURL || ''} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* My Activity Section */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
          My Activity
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate('/favorites')}>
          <Heart className="mr-2 h-4 w-4 text-rose-500" />
          <span>Saved Properties</span>
          {favorites.length > 0 && (
            <span className="ml-auto text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">
              {favorites.length}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/seller?tab=my-listings')}>
          <Building2 className="mr-2 h-4 w-4 text-blue-500" />
          <span>My Listings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/discover')}>
          <Eye className="mr-2 h-4 w-4 text-purple-500" />
          <span>Browse Properties</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/seller?tab=leads')}>
          <History className="mr-2 h-4 w-4 text-amber-500" />
          <span>My Leads</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
