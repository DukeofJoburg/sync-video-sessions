import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Session, User, VideoState, VideoAction } from '@/lib/types';
import { generateSessionId } from '@/lib/mockData';

interface SessionContextProps {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateVideoState: (newState: VideoState) => void;
  sendVideoAction: (action: VideoAction) => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Generate a session ID if one doesn't exist in local storage
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', generateSessionId());
    }

    // Here, you would typically fetch the session data from an API
    // based on the session ID stored in local storage.
    // For now, we'll leave it as null.
  }, []);

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
