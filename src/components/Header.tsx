
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/context/SessionContext';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { session, leaveSession } = useSession();

  const handleLeaveSession = () => {
    leaveSession();
    navigate('/');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
      "py-4 px-6 md:px-10 flex items-center justify-between",
      session ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
    )}>
      <div className="flex items-center">
        <div 
          className="text-2xl font-medium tracking-tight cursor-pointer animate-fade-in"
          onClick={() => navigate('/')}
        >
          SyncWatch
        </div>
        {session && (
          <div className="ml-6 text-sm text-muted-foreground animate-fade-in">
            Session ID: <span className="font-medium">{session.id}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {session ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLeaveSession}
            className="animate-fade-in"
          >
            Leave Session
          </Button>
        ) : (
          <div className="flex items-center gap-2 animate-fade-in">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/join')}
            >
              Join Session
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate('/create')}
            >
              Create Session
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
