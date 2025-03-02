
export type UserRole = 'admin' | 'primary' | 'secondary';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  order?: number; // For primary users, determines succession order
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  quality?: string;
}

export interface Session {
  id: string;
  videoUrl: string;
  videoId: string;
  createdAt: Date;
  updatedAt: Date;
  users: User[];
  videoState: VideoState;
}

export interface VideoAction {
  type: 'play' | 'pause' | 'seek' | 'volume' | 'mute' | 'unmute' | 'quality';
  payload?: any;
  userId: string;
}
