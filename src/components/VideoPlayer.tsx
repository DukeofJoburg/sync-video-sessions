
import React, { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings
} from 'lucide-react';

const VideoPlayer = () => {
  const playerRef = useRef<ReactPlayer>(null);
  const { 
    session, 
    currentUser, 
    updateVideoState,
    sendVideoAction 
  } = useSession();

  if (!session) return null;

  const { videoState, videoUrl } = session;
  const { isPlaying, currentTime, volume, muted, playbackRate } = videoState;

  // Determine if user has play/pause/seek permissions (admin or primary role)
  const hasFullControl = currentUser?.role === 'admin' || currentUser?.role === 'primary';

  const handlePlay = () => {
    if (!hasFullControl) return;
    sendVideoAction({
      type: 'play',
      userId: currentUser!.id
    });
  };

  const handlePause = () => {
    if (!hasFullControl) return;
    sendVideoAction({
      type: 'pause',
      userId: currentUser!.id
    });
  };

  const handleSeek = (time: number) => {
    if (!hasFullControl) return;
    sendVideoAction({
      type: 'seek',
      payload: time,
      userId: currentUser!.id
    });
  };

  const handleVolumeChange = (value: number[]) => {
    updateVideoState({
      ...videoState,
      volume: value[0]
    });
  };

  const toggleMute = () => {
    updateVideoState({
      ...videoState,
      muted: !muted
    });
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    // Only update time if not seeking to avoid interference
    updateVideoState({
      ...videoState,
      currentTime: state.playedSeconds
    });
  };

  const handleDuration = (duration: number) => {
    updateVideoState({
      ...videoState,
      duration
    });
  };

  return (
    <div className="video-player-container rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-video bg-black relative">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          progressInterval={1000}
          onPlay={handlePlay}
          onPause={handlePause}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            playerVars: {
              modestbranding: 1,
              rel: 0
            }
          }}
        />
      </div>
      
      <div className="bg-gray-900 p-3 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={!hasFullControl}
            className={!hasFullControl ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          
          <div className="flex-1 px-2">
            <div className="text-xs text-gray-400 flex justify-between mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(videoState.duration)}</span>
            </div>
            <Slider 
              disabled={!hasFullControl}
              value={[currentTime]}
              max={videoState.duration || 100}
              step={0.1}
              onValueChange={(value) => handleSeek(value[0])}
              className={!hasFullControl ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            
            <div className="w-20 hidden sm:block">
              <Slider 
                value={[muted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
