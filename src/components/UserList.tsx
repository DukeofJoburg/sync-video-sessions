
import React, { useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { User, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Crown, Shield, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const UserAvatar: React.FC<{ user: User; size?: number }> = ({ user, size = 8 }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          `size-${size} flex items-center justify-center rounded-full text-white font-medium select-none`,
          user.role === 'admin' ? 'user-avatar admin' : 
          user.role === 'primary' ? 'user-avatar primary' : 
          'user-avatar secondary'
        )}
      >
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="rounded-full size-full object-cover"
          />
        ) : (
          <span className={`text-${size === 8 ? 'xs' : 'sm'}`}>{getInitials(user.name)}</span>
        )}
      </div>
      
      <div className={cn(
        "user-badge",
        user.role === 'admin' ? 'user-badge admin' : 
        user.role === 'primary' ? 'user-badge primary' : 
        'user-badge secondary'
      )} />
    </div>
  );
};

const UserListItem: React.FC<{ user: User; order?: number }> = ({ user, order }) => {
  const { currentUser, isAdmin, promoteToAdmin, promoteToPrimary, demoteToSecondary } = useSession();
  
  const canManageUser = isAdmin && currentUser?.id !== user.id;
  
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} />
        
        <div className="flex flex-col">
          <div className="text-sm font-medium flex items-center gap-1.5">
            {user.name}
            {user.role === 'admin' && <Crown size={14} className="text-amber-500" />}
          </div>
          <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
            {user.role}
            {user.role === 'primary' && order !== undefined && (
              <span className="text-xs text-muted-foreground">#{order}</span>
            )}
            {user.id === currentUser?.id && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">You</span>
            )}
          </div>
        </div>
      </div>
      
      {canManageUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {user.role === 'secondary' && (
              <DropdownMenuItem onClick={() => promoteToPrimary(user.id)}>
                <Shield size={14} className="mr-2" />
                Promote
              </DropdownMenuItem>
            )}
            
            {user.role === 'primary' && (
              <>
                <DropdownMenuItem onClick={() => promoteToAdmin(user.id)}>
                  <Crown size={14} className="mr-2" />
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => demoteToSecondary(user.id)}>
                  <ChevronDown size={14} className="mr-2" />
                  Demote
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

const UserList: React.FC = () => {
  const { session, getPrimaryUsers, getSecondaryUsers, refreshSession } = useSession();
  const { toast } = useToast();
  
  // Auto-refresh participant list periodically
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshSession();
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(refreshInterval);
  }, [refreshSession]);
  
  if (!session) {
    return null;
  }
  
  const primaryUsers = getPrimaryUsers();
  const secondaryUsers = getSecondaryUsers();
  
  const handleRefresh = () => {
    refreshSession();
    toast({
      title: "Participants Refreshed",
      description: "The participant list has been updated",
      duration: 3000
    });
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col">
        <div className="flex justify-between items-center px-3 py-2">
          <h3 className="text-sm font-medium text-muted-foreground">Primary Users</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 hover:bg-secondary transition-colors" 
            onClick={handleRefresh}
            title="Refresh Participants"
          >
            <RefreshCw size={14} className="text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
        
        <div className="space-y-0.5">
          {primaryUsers.map((user, index) => (
            <UserListItem key={user.id} user={user} order={index} />
          ))}
          
          {primaryUsers.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground/50 italic">
              No primary users
            </div>
          )}
        </div>
        
        <div className="px-3 py-2 mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">Secondary Users</h3>
        </div>
        
        <div className="space-y-0.5">
          {secondaryUsers.map(user => (
            <UserListItem key={user.id} user={user} />
          ))}
          
          {secondaryUsers.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground/50 italic">
              No secondary users
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
