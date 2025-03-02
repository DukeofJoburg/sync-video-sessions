
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Session, User, VideoState, VideoAction, UserRole } from '@/lib/types';
import { generateSessionId } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface SessionContextProps {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateVideoState: (newState: VideoState) => void;
  sendVideoAction: (action: VideoAction) => void;
  // Added methods for session management
  createSession: (videoUrl: string, userName: string) => string;
  joinSession: (sessionId: string, userName: string) => boolean;
  leaveSession: () => void;
  // Added methods for user management
  isAdmin: boolean;
  promoteToAdmin: (userId: string) => void;
  promoteToPrimary: (userId: string) => void;
  demoteToSecondary: (userId: string) => void;
  // Added methods for user filtering
  getPrimaryUsers: () => User[];
  getSecondaryUsers: () => User[];
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

// Helper to extract YouTube ID from various formats of URLs
const extractYouTubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    // Generate a session ID if one doesn't exist in local storage
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', generateSessionId());
    }

    // Here, you would typically fetch the session data from an API
    // based on the session ID stored in local storage.
    // For now, we'll leave it as null.
  }, []);

  // Create a new session
  const createSession = (videoUrl: string, userName: string): string => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      console.error('Invalid YouTube URL');
      return '';
    }

    const userId = uuidv4();
    const sessionId = generateSessionId();
    
    const newUser: User = {
      id: userId,
      name: userName,
      role: 'admin' // Creator is always the admin
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
        volume: 0.5,
        muted: false,
        playbackRate: 1
      }
    };

    setSession(newSession);
    setCurrentUser(newUser);
    localStorage.setItem('currentSession', sessionId);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return sessionId;
  };

  // Join an existing session
  const joinSession = (sessionId: string, userName: string): boolean => {
    // In a real implementation, this would fetch session data from an API
    // For now, we'll simulate success
    const userId = uuidv4();
    
    // For demo purposes - normally you'd fetch this from a backend
    const newUser: User = {
      id: userId,
      name: userName,
      role: 'secondary' // New joiners start as secondary users
    };

    // Mock session data
    const mockSession: Session = {
      id: sessionId,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
      videoId: 'dQw4w9WgXcQ',
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [
        // Admin user
        {
          id: 'admin-id',
          name: 'Admin User',
          role: 'admin'
        },
        // New user
        newUser
      ],
      videoState: {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.5,
        muted: false,
        playbackRate: 1
      }
    };

    setSession(mockSession);
    setCurrentUser(newUser);
    localStorage.setItem('currentSession', sessionId);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return true;
  };

  // Leave the current session
  const leaveSession = () => {
    if (!session || !currentUser) return;

    // In a real implementation, you would notify other users
    // For now, we'll just clear the local state
    setSession(null);
    setCurrentUser(null);
    localStorage.removeItem('currentSession');
    localStorage.removeItem('currentUser');
  };

  // Promote a user to admin
  const promoteToAdmin = (userId: string) => {
    if (!session || !isAdmin) return;

    setSession(prevSession => {
      if (!prevSession) return null;
      
      return {
        ...prevSession,
        users: prevSession.users.map(user => 
          user.id === userId ? { ...user, role: 'admin' as UserRole } : user
        ),
        updatedAt: new Date()
      };
    });
  };

  // Promote a user to primary
  const promoteToPrimary = (userId: string) => {
    if (!session || !isAdmin) return;

    setSession(prevSession => {
      if (!prevSession) return null;
      
      return {
        ...prevSession,
        users: prevSession.users.map(user => 
          user.id === userId ? { ...user, role: 'primary' as UserRole } : user
        ),
        updatedAt: new Date()
      };
    });
  };

  // Demote a user to secondary
  const demoteToSecondary = (userId: string) => {
    if (!session || !isAdmin) return;

    setSession(prevSession => {
      if (!prevSession) return null;
      
      return {
        ...prevSession,
        users: prevSession.users.map(user => 
          user.id === userId ? { ...user, role: 'secondary' as UserRole } : user
        ),
        updatedAt: new Date()
      };
    });
  };

  // Get list of primary users
  const getPrimaryUsers = (): User[] => {
    if (!session) return [];
    return session.users.filter(user => user.role === 'admin' || user.role === 'primary')
      .sort((a, b) => {
        if (a.role === 'admin') return -1;
        if (b.role === 'admin') return 1;
        return 0;
      });
  };

  // Get list of secondary users
  const getSecondaryUsers = (): User[] => {
    if (!session) return [];
    return session.users.filter(user => user.role === 'secondary');
  };

  const updateVideoState = (newState: VideoState) => {
    if (!session) return;
    
    setSession({
      ...session,
      videoState: newState,
      updatedAt: new Date()
    });
  };

  const sendVideoAction = (action: VideoAction) => {
    if (!session) return;
    
    // For now, directly apply the action to the local state
    // In a real implementation, this would send the action to other users
    switch (action.type) {
      case 'play':
        updateVideoState({
          ...session.videoState,
          isPlaying: true
        });
        break;
      case 'pause':
        updateVideoState({
          ...session.videoState,
          isPlaying: false
        });
        break;
      case 'seek':
        updateVideoState({
          ...session.videoState,
          currentTime: action.payload
        });
        break;
      // Handle other action types as needed
    }
  };

  const contextValue: SessionContextProps = {
    session,
    setSession,
    currentUser,
    setCurrentUser,
    updateVideoState,
    sendVideoAction,
    createSession,
    joinSession,
    leaveSession,
    isAdmin,
    promoteToAdmin,
    promoteToPrimary,
    demoteToSecondary,
    getPrimaryUsers,
    getSecondaryUsers
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
