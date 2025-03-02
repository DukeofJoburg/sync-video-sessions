
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const JoinSession: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { joinSession } = useSession();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !userName) return;

    setIsSubmitting(true);
    try {
      const success = joinSession(sessionId, userName);
      if (success) {
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
          <CardTitle className="text-2xl font-semibold tracking-tight">Join Session</CardTitle>
          <CardDescription>
            Enter a session ID to join an existing video viewing session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                placeholder="Enter session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
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
            disabled={!sessionId || !userName || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Joining...' : 'Join Session'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinSession;
