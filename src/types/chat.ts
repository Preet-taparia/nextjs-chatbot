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

export interface ChatResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export type SendMessageResponse = ChatResponse<{
  userMessage: Message;
  aiResponse: Message;
  sessionId: string;
}>;
