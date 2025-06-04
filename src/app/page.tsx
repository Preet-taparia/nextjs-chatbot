// app/page.tsx
"use client";

import React, { useState } from 'react';
import FloatingChatButton from '@/components/ui/floating-chat-button';
import ChatModal from '@/components/ui/chat-modal';

const HomePage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <main className="min-h-screen bg-background">
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to AI Chat
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the power of AI conversation. Click the chat button 
            to start talking with our intelligent assistant.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Powered</h3>
              <p className="text-muted-foreground text-sm">
                Powered by Google&apos;s Gemini AI for intelligent and contextual responses.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Persistent Chat</h3>
              <p className="text-muted-foreground text-sm">
                Your conversations are saved and can be resumed anytime.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast & Responsive</h3>
              <p className="text-muted-foreground text-sm">
                Built with Next.js and optimized for performance and user experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton
        isOpen={isChatOpen}
        onClick={toggleChat}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={closeChat}
      />
    </main>
  );
};

export default HomePage;