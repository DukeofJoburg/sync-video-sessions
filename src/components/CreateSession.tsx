
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CreateSession: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSession } = useSession();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !userName) return;

    setIsSubmitting(true);
    try {
      const sessionId = createSession(videoUrl, userName);
      if (sessionId) {
        // Navigate to the session page
        navigate(`/session/${sessionId}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full my-16 px-4 animate-fade-in">
      <Card className="w-full max-w-md glass-panel animate-scale-in">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Create Session</CardTitle>
          <CardDescription>
            Create a new video viewing session and invite others to join
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">YouTube Video URL</Label>
              <Input
                id="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={!videoUrl || !userName || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Session'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateSession;
