
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Monitor, Users, Play } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 overflow-hidden">
      <Header />
      
      <main className="container max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col items-center text-center space-y-6 my-12 animate-fade-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/80 text-xs font-medium mb-2 animate-slide-up">
            Synchronized Video Experience
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-balance animate-slide-up" style={{ animationDelay: '100ms' }}>
            Watch together. <br className="hidden md:block" />
            <span className="text-primary/90">Stay in sync.</span>
          </h1>
          
          <p className="max-w-2xl text-lg text-muted-foreground text-balance animate-slide-up" style={{ animationDelay: '200ms' }}>
            Create a synchronized video session, invite friends, and experience content together in perfect harmony.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <Button size="lg" onClick={() => navigate('/create')} className="min-w-40">
              Create Session
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/join')} className="min-w-40">
              Join Session
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {[
            {
              icon: <Monitor size={24} />,
              title: "Synchronized Playback",
              description: "Everyone watches the same content at the exact same time. When the admin or a primary user plays, pauses, or seeks, everyone's video adjusts automatically."
            },
            {
              icon: <Users size={24} />,
              title: "Role-Based Controls",
              description: "Admins have full control and can promote users to primary or demote them back to secondary. Primary users can control playback while secondary users can only adjust their own volume."
            },
            {
              icon: <Play size={24} />,
              title: "Seamless Experience",
              description: "Join with just a session ID, no accounts required. The elegant interface puts the focus on the shared viewing experience, not complex controls."
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center p-6 text-center space-y-3 glass-panel rounded-xl animate-scale-in"
              style={{ animationDelay: `${index * 100 + 400}ms` }}
            >
              <div className="p-3 rounded-full bg-primary/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
