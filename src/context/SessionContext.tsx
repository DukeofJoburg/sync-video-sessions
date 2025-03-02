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
  createSession: (videoUrl: string, userName: string) => string;
  joinSession: (sessionId: string, userName: string) => boolean;
  leaveSession: () => void;
  isAdmin: boolean;
  promoteToAdmin: (userId: string) => void;
  promoteToPrimary: (userId: string) => void;
  demoteToSecondary: (userId: string) => void;
  getPrimaryUsers: () => User[];
  getSecondaryUsers: () => User[];
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

const extractYouTubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const isAdmin = currentUser?.role === 'admin';

  const refreshSession = () => {
    setLastRefresh(new Date());
  };

  useEffect(() => {
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', generateSessionId());
    }

    const storedSessionId = localStorage.getItem('currentSession');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedSessionId && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        const mockSession: Session = {
          id: storedSessionId,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoId: 'dQw4w9WgXcQ',
          createdAt: new Date(),
          updatedAt: new Date(),
          users: [
            {
              id: 'admin-id',
              name: 'Admin User',
              role: 'admin'
            },
            parsedUser
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
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('currentSession');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

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
      role: 'admin'
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

  const joinSession = (sessionId: string, userName: string): boolean => {
    const userId = uuidv4();
    
    const newUser: User = {
      id: userId,
      name: userName,
      role: 'secondary'
    };

    const mockSession: Session = {
      id: sessionId,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoId: 'dQw4w9WgXcQ',
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [
        {
          id: 'admin-id',
          name: 'Admin User',
          role: 'admin'
        },
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

  const leaveSession = () => {
    if (!session || !currentUser) return;

    setSession(null);
    setCurrentUser(null);
    localStorage.removeItem('currentSession');
    localStorage.removeItem('currentUser');
  };

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

  const getPrimaryUsers = (): User[] => {
    if (!session) return [];
    return session.users.filter(user => user.role === 'admin' || user.role === 'primary')
      .sort((a, b) => {
        if (a.role === 'admin') return -1;
        if (b.role === 'admin') return 1;
        return 0;
      });
  };

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
      case 'quality':
        updateVideoState({
          ...session.videoState,
          quality: action.payload
        });
        break;
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
    getSecondaryUsers,
    refreshSession
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
