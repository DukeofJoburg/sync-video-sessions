
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import VideoPlayer from '@/components/VideoPlayer';
import UserList from '@/components/UserList';
import Header from '@/components/Header';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Session = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, currentUser } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user is in a session with the matching ID
    if (!session) {
      navigate('/join');
      return;
    }

    if (session.id !== sessionId) {
      navigate(`/session/${session.id}`);
    }
  }, [session, sessionId, navigate]);

  if (!session || !currentUser) {
    return null;
  }

  const copySessionLink = () => {
    const url = `${window.location.origin}/join?session=${session.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share this link with friends to invite them"
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold tracking-tight animate-slide-up">
                  Watching Together
                </h1>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copySessionLink}
                  className="animate-fade-in flex items-center gap-2"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Share Link</span>
                </Button>
              </div>
              
              <VideoPlayer />
            </div>
            
            {/* Sidebar */}
            <div className="w-full md:w-64 glass-panel p-4 rounded-lg animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Participants</h2>
              <UserList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Session;
