"use client";

import React, { useState } from 'react';
import FloatingChatButton from '@/components/floating-chat-button';
import ChatModal from '@/components/chat-modal';

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
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            TechInterview Pro
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master your technical interviews with AI-powered practice sessions. 
            Chat with our assistant to learn about our platform, pricing, and features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Coding Sessions</h3>
              <p className="text-muted-foreground text-sm">
                Practice real-time coding interviews with industry-standard problems and feedback.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Mock Interviews</h3>
              <p className="text-muted-foreground text-sm">
                Simulate real interview environments with personalized feedback and scoring.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Track your improvement across different technical domains and skill levels.
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-4">Why Choose TechInterview Pro?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>1000+ curated technical interview questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>AI-powered feedback and hints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Company-specific interview prep</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Real-time collaboration tools</span>
                </li>
              </ul>
            </div>
            
            <div className="text-left">
              <h2 className="text-2xl font-bold mb-4">Supported Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'System Design', 'Algorithms', 'Data Structures'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingChatButton
        isOpen={isChatOpen}
        onClick={toggleChat}
      />

      <ChatModal
        isOpen={isChatOpen}
        onClose={closeChat}
      />
    </main>
  );
};

export default HomePage;