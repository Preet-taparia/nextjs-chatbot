// types/chat.ts
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sessionId?: string;
}

export interface ChatSession {
  _id?: string;
  sessionId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendMessageResponse extends ChatResponse {
  data?: {
    userMessage: Message;
    aiResponse: Message;
    sessionId: string;
  };
}