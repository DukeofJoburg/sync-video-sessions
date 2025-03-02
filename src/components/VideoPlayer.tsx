
import React, { useEffect, useRef, useState } from 'react';
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
  Settings, 
  Fullscreen,
  MonitorPlay,
  ChevronDown,
  ChevronUp,
  Monitor
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Available YouTube resolutions
const RESOLUTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'hd1080', label: '1080p' },
  { value: 'hd720', label: '720p' },
  { value: 'large', label: '480p' },
  { value: 'medium', label: '360p' },
  { value: 'small', label: '240p' },
  { value: 'tiny', label: '144p' },
];

const VideoPlayer = () => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    session, 
    currentUser, 
    updateVideoState,
    sendVideoAction 
  } = useSession();
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [resolution, setResolution] = useState('auto');

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

  const handleResolutionChange = (value: string) => {
    setResolution(value);
    // In a real app, we would update this for all users
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        const video = containerRef.current?.querySelector('video');
        if (video) {
          await video.requestPictureInPicture();
        }
      }
    } catch (err) {
      console.error('Picture-in-Picture failed:', err);
    }
  };

  return (
    <div ref={containerRef} className="video-player-container rounded-lg overflow-hidden shadow-lg">
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
            
            {/* Resolution selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Monitor size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 bg-gray-800 border-gray-700 text-white p-2">
                <div className="p-2">
                  <h4 className="font-medium mb-2">Quality</h4>
                  <RadioGroup value={resolution} onValueChange={handleResolutionChange}>
                    {RESOLUTIONS.map((res) => (
                      <div key={res.value} className="flex items-center space-x-2 mb-1">
                        <RadioGroupItem id={res.value} value={res.value} />
                        <Label htmlFor={res.value} className="text-white">{res.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Picture-in-Picture toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={togglePictureInPicture}
            >
              <MonitorPlay size={18} />
            </Button>
            
            {/* Fullscreen toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleFullscreen}
            >
              <Fullscreen size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
