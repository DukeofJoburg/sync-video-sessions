
import { User, Session, UserRole, VideoState } from './types';

// Mock users for development
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    avatar: '',
    role: 'admin',
    order: 0
  },
  {
    id: '2',
    name: 'Primary User 1',
    avatar: '',
    role: 'primary',
    order: 1
  },
  {
    id: '3',
    name: 'Primary User 2',
    avatar: '',
    role: 'primary',
    order: 2
  },
  {
    id: '4',
    name: 'Secondary User 1',
    avatar: '',
    role: 'secondary'
  },
  {
    id: '5',
    name: 'Secondary User 2',
    avatar: '',
    role: 'secondary'
  }
];

// Mock video state
export const mockVideoState: VideoState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  playbackRate: 1,
  quality: 'auto'
};

// Mock session
export const mockSession: Session = {
  id: 'session-123',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  videoId: 'dQw4w9WgXcQ',
  createdAt: new Date(),
  updatedAt: new Date(),
  users: mockUsers,
  videoState: mockVideoState
};

// Utility to extract YouTube video ID from URL
export const extractYouTubeId = (url: string): string => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : '';
};

// Generate a random session ID
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
