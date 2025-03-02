
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, UserRole, VideoState, VideoAction } from '@/lib/types';
import { mockSession, generateSessionId, extractYouTubeId } from '@/lib/mockData';
import { useToast } from '@/components/ui/use-toast';

interface SessionContextProps {
  session: Session | null;
  currentUser: User | null;
  isAdmin: boolean;
  isPrimary: boolean;
  isSecondary: boolean;
  createSession: (videoUrl: string, userName: string) => string;
  joinSession: (sessionId: string, userName: string) => boolean;
  leaveSession: () => void;
  updateVideoState: (newState: Partial<VideoState>) => void;
  performVideoAction: (action: VideoAction) => void;
  promoteToAdmin: (userId: string) => void;
  promoteToPrimary: (userId: string) => void;
  demoteToSecondary: (userId: string) => void;
  setVideoUrl: (url: string) => void;
  getPrimaryUsers: () => User[];
  getSecondaryUsers: () => User[];
  canControlPlayback: boolean;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  // For development, load mock session - in production this would connect to a real backend
  useEffect(() => {
    // In a real app, we would check localStorage or a cookie for an existing session
    const loadMockSession = () => {
      // Only for development - remove for production
      if (process.env.NODE_ENV === 'development') {
        if (!session) {
          // Only load mock data if no session exists
          // setSession(mockSession);
          // setCurrentUser(mockUsers[0]);
        }
      }
    };

    loadMockSession();
  }, [session]);

  const isAdmin = !!currentUser && currentUser.role === 'admin';
  const isPrimary = !!currentUser && (currentUser.role === 'admin' || currentUser.role === 'primary');
  const isSecondary = !!currentUser && currentUser.role === 'secondary';
  const canControlPlayback = isPrimary;

  // Create a new viewing session
  const createSession = (videoUrl: string, userName: string): string => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive"
      });
      return '';
    }

    const sessionId = generateSessionId();
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: userName,
      role: 'admin',
      order: 0
    };

    const newSession: Session = {
      id: sessionId,
      videoUrl,
      videoId,
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [newUser],
      videoState: {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        muted: false,
        playbackRate: 1,
        quality: 'auto'
      }
    };

    setSession(newSession);
    setCurrentUser(newUser);

    toast({
      title: "Session Created",
      description: `Share the session ID with others: ${sessionId}`
    });

    return sessionId;
  };

  // Join an existing session
  const joinSession = (sessionId: string, userName: string): boolean => {
    // In a real app, we would make an API call to join the session
    // For development, we're just using the mock session if IDs match
    if (!sessionId) {
      toast({
        title: "Invalid Session ID",
        description: "Please enter a valid session ID",
        variant: "destructive"
      });
      return false;
    }

    // For development only - in production this would validate against a real backend
    if (session && session.id === sessionId) {
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: userName,
        role: 'secondary'
      };

      const updatedUsers = [...session.users, newUser];
      setSession({ ...session, users: updatedUsers });
      setCurrentUser(newUser);

      toast({
        title: "Joined Session",
        description: `You have joined the session as ${userName}`
      });

      return true;
    } else if (sessionId === mockSession.id) {
      // For development only
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: userName,
        role: 'secondary'
      };

      const mockSessionCopy = { ...mockSession, users: [...mockSession.users, newUser] };
      setSession(mockSessionCopy);
      setCurrentUser(newUser);

      toast({
        title: "Joined Session",
        description: `You have joined the session as ${userName}`
      });

      return true;
    }

    toast({
      title: "Session Not Found",
      description: "The session ID you entered was not found",
      variant: "destructive"
    });
    return false;
  };

  // Leave the current session
  const leaveSession = () => {
    if (!session || !currentUser) return;

    // If the current user is the admin, promote the next primary user
    if (currentUser.role === 'admin') {
      const primaryUsers = session.users
        .filter(user => user.role === 'primary')
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      if (primaryUsers.length > 0) {
        // Promote the next primary user to admin
        const nextAdmin = primaryUsers[0];
        const updatedUsers = session.users.map(user => {
          if (user.id === nextAdmin.id) {
            return { ...user, role: 'admin' as UserRole, order: 0 };
          }
          // Adjust order for remaining primary users
          if (user.role === 'primary' && user.order && user.order > (nextAdmin.order || 0)) {
            return { ...user, order: (user.order - 1) };
          }
          return user;
        });

        setSession({ ...session, users: updatedUsers.filter(user => user.id !== currentUser.id) });
        toast({
          title: "Admin Left",
          description: `${nextAdmin.name} is now the admin`
        });
      } else {
        // If no primary users, session ends
        setSession(null);
        toast({
          title: "Session Ended",
          description: "The admin left and there are no primary users to take over"
        });
      }
    } else {
      // If not admin, just remove the user
      setSession({
        ...session,
        users: session.users.filter(user => user.id !== currentUser.id)
      });
      
      toast({
        title: "Left Session",
        description: "You have left the session"
      });
    }

    setCurrentUser(null);
  };

  // Update video state (for internal state management)
  const updateVideoState = (newState: Partial<VideoState>) => {
    if (!session) return;
    setSession({
      ...session,
      videoState: { ...session.videoState, ...newState },
      updatedAt: new Date()
    });
  };

  // Perform a video action (would be synced with other users in a real app)
  const performVideoAction = (action: VideoAction) => {
    if (!session || !currentUser) return;
    
    // Check permissions based on action type and user role
    if ((action.type === 'play' || action.type === 'pause' || action.type === 'seek') && 
        !canControlPlayback) {
      toast({
        title: "Permission Denied",
        description: "Only admin and primary users can control playback",
        variant: "destructive"
      });
      return;
    }

    // Process the action and update video state
    switch (action.type) {
      case 'play':
        updateVideoState({ isPlaying: true });
        break;
      case 'pause':
        updateVideoState({ isPlaying: false });
        break;
      case 'seek':
        updateVideoState({ currentTime: action.payload });
        break;
      case 'volume':
        updateVideoState({ volume: action.payload });
        break;
      case 'mute':
        updateVideoState({ muted: true });
        break;
      case 'unmute':
        updateVideoState({ muted: false });
        break;
      case 'quality':
        updateVideoState({ quality: action.payload });
        break;
    }

    // In a real app, this would emit the action to other clients via WebSocket
  };

  // Promote a user to admin (only current admin can do this)
  const promoteToAdmin = (userId: string) => {
    if (!session || !isAdmin) return;

    const userToPromote = session.users.find(user => user.id === userId);
    if (!userToPromote) return;

    const currentAdmin = session.users.find(user => user.role === 'admin');
    if (!currentAdmin) return;

    // Update the roles
    const updatedUsers = session.users.map(user => {
      if (user.id === userId) {
        return { ...user, role: 'admin' as UserRole, order: 0 };
      }
      if (user.id === currentAdmin.id) {
        return { ...user, role: 'primary' as UserRole, order: 1 };
      }
      // Adjust order for all other primary users
      if (user.role === 'primary' && user.order !== undefined) {
        return { ...user, order: user.order + 1 };
      }
      return user;
    });

    setSession({ ...session, users: updatedUsers });
    
    // If the current user was the admin, update their role
    if (currentUser?.id === currentAdmin.id) {
      setCurrentUser({ ...currentUser, role: 'primary', order: 1 });
    }

    toast({
      title: "Admin Role Transferred",
      description: `${userToPromote.name} is now the admin`
    });
  };

  // Promote a secondary user to primary
  const promoteToPrimary = (userId: string) => {
    if (!session || !isAdmin) return;

    const userToPromote = session.users.find(user => user.id === userId && user.role === 'secondary');
    if (!userToPromote) return;

    // Find the highest order among primary users
    const primaryUsers = session.users.filter(user => user.role === 'primary');
    const maxOrder = primaryUsers.length > 0 
      ? Math.max(...primaryUsers.map(user => user.order || 0))
      : 0;

    // Update the user's role
    const updatedUsers = session.users.map(user => {
      if (user.id === userId) {
        return { ...user, role: 'primary' as UserRole, order: maxOrder + 1 };
      }
      return user;
    });

    setSession({ ...session, users: updatedUsers });
    
    toast({
      title: "User Promoted",
      description: `${userToPromote.name} is now a primary user`
    });
  };

  // Demote a primary user to secondary
  const demoteToSecondary = (userId: string) => {
    if (!session || !isAdmin) return;

    const userToDemote = session.users.find(user => user.id === userId && user.role === 'primary');
    if (!userToDemote) return;

    const demotedOrder = userToDemote.order;

    // Update the user's role and adjust other primary users' order
    const updatedUsers = session.users.map(user => {
      if (user.id === userId) {
        const { order, ...rest } = user; // Remove the order property
        return { ...rest, role: 'secondary' as UserRole };
      }
      // Adjust order for primary users
      if (user.role === 'primary' && user.order !== undefined && demotedOrder !== undefined && user.order > demotedOrder) {
        return { ...user, order: user.order - 1 };
      }
      return user;
    });

    setSession({ ...session, users: updatedUsers });
    
    toast({
      title: "User Demoted",
      description: `${userToDemote.name} is now a secondary user`
    });
  };

  // Change the video URL for the session
  const setVideoUrl = (url: string) => {
    if (!session || !isAdmin) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    setSession({
      ...session,
      videoUrl: url,
      videoId,
      videoState: {
        ...session.videoState,
        isPlaying: false,
        currentTime: 0
      },
      updatedAt: new Date()
    });

    toast({
      title: "Video Changed",
      description: "The session video has been updated"
    });
  };

  // Get all primary users sorted by order
  const getPrimaryUsers = (): User[] => {
    if (!session) return [];
    
    const admin = session.users.find(user => user.role === 'admin');
    const primaryUsers = session.users
      .filter(user => user.role === 'primary')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return admin ? [admin, ...primaryUsers] : primaryUsers;
  };

  // Get all secondary users
  const getSecondaryUsers = (): User[] => {
    if (!session) return [];
    return session.users.filter(user => user.role === 'secondary');
  };

  return (
    <SessionContext.Provider value={{
      session,
      currentUser,
      isAdmin,
      isPrimary,
      isSecondary,
      createSession,
      joinSession,
      leaveSession,
      updateVideoState,
      performVideoAction,
      promoteToAdmin,
      promoteToPrimary,
      demoteToSecondary,
      setVideoUrl,
      getPrimaryUsers,
      getSecondaryUsers,
      canControlPlayback
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
