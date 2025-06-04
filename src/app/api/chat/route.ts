// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { gemini } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import ChatModel from '@/models/chat';
import { Message, SendMessageRequest, ChatResponse } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

// Generate session ID if not provided
function generateSessionId(): string {
  return `session_${uuidv4()}_${Date.now()}`;
}

// GET: Retrieve chat history for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    await connectDB();
    
    const chatSession = await ChatModel.findOne({ sessionId });
    
    if (!chatSession) {
      return NextResponse.json({
        success: true,
        data: { messages: [], sessionId }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: chatSession.messages,
        sessionId: chatSession.sessionId
      }
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch chat history'
    }, { status: 500 });
  }
}

// POST: Send message and get AI response
export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { message, sessionId: providedSessionId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    await connectDB();

    // Generate session ID if not provided
    const sessionId = providedSessionId || generateSessionId();

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      sessionId
    };

    // Find or create chat session
    let chatSession = await ChatModel.findOne({ sessionId });
    if (!chatSession) {
      chatSession = new ChatModel({
        sessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add user message to session
    chatSession.messages.push(userMessage);

    // Prepare conversation history for AI
    const conversationHistory = chatSession.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response using Gemini
    const { textStream } = streamText({
      model: gemini('gemini-1.5-flash'),
      messages: conversationHistory,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Collect the streamed response
    let aiResponseContent = '';
    for await (const chunk of textStream) {
      aiResponseContent += chunk;
    }

    // Create AI message
    const aiMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponseContent.trim(),
      timestamp: new Date(),
      sessionId
    };

    // Add AI message to session
    chatSession.messages.push(aiMessage);

    // Save to database
    await chatSession.save();

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        aiResponse: aiMessage,
        sessionId
      }
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process message'
    }, { status: 500 });
  }
}

// DELETE: Clear chat history for a session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    await connectDB();
    
    await ChatModel.deleteOne({ sessionId });

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear chat history'
    }, { status: 500 });
  }
}