"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Message, SendMessageRequest, SendMessageResponse } from '@/types/chat';
import ChatMessage from './chat-message';
import ChatInput from './chat-input';
import { cn } from '@/lib/utils';

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Generate session ID on mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  const loadChatHistory = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.success && data.data.messages) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError('');
    setIsLoading(true);

    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      sessionId
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const requestData: SendMessageRequest = {
        message: content.trim(),
        sessionId
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data: SendMessageResponse = await response.json();

      if (data.success && data.data) {
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== userMessage.id);
          return [...filtered, data.data!.userMessage, data.data!.aiResponse];
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong');
      
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessages([]);
        setError('');
      } else {
        throw new Error(data.error || 'Failed to clear chat');
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to clear chat');
    }
  };

  const refreshChat = () => {
    loadChatHistory();
    setError('');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Start a conversation
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Ask me anything! I'm here to help you with information, 
                answer questions, or just have a friendly chat.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}
      </div>

      {messages.length > 0 && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-border">
          <button
            onClick={refreshChat}
            className={cn(
              "p-2 rounded-lg hover:bg-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            title="Refresh chat"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={clearChat}
            className={cn(
              "p-2 rounded-lg hover:bg-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            title="Clear chat history"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isLoading}
          placeholder="Type your message here..."
        />
      </div>
    </div>
  );
};

export default ChatContainer;