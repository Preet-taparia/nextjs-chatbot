import { Schema, model, models } from 'mongoose';
import { ChatSession } from '@/types/chat';

const MessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSessionSchema = new Schema<ChatSession>({
  sessionId: { 
    type: String, 
    required: true, 
    index: true 
  },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ChatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ChatModel = models.ChatSession || model<ChatSession>('ChatSession', ChatSessionSchema);

export default ChatModel;