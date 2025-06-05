import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { gemini } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import ChatModel from '@/models/chat';
import { Message, SendMessageRequest } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const chatSessions = await ChatModel.find({}).sort({ updatedAt: -1 });    
    const allMessages: Message[] = [];
    chatSessions.forEach(session => {
      allMessages.push(...session.messages);
    });
    
    allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: { messages: allMessages }
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch chat history'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    await connectDB();

    const sessionId = `global_chat_${Date.now()}`;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    const recentSessions = await ChatModel.find({}).sort({ updatedAt: -1 }).limit(5);
    const recentMessages: Message[] = [];
    
    recentSessions.forEach(session => {
      recentMessages.push(...session.messages);
    });
    
    recentMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const conversationHistory = recentMessages.slice(-20).map((msg: Message) => ({
      role: msg.role,
      content: msg.content
    }));

    conversationHistory.push({
      role: userMessage.role,
      content: userMessage.content
    });

    const { textStream } = streamText({
      model: gemini('gemini-1.5-flash'),
      messages: conversationHistory,
      temperature: 0.7,
      maxTokens: 1000,
    });

    let aiResponseContent = '';
    for await (const chunk of textStream) {
      aiResponseContent += chunk;
    }

    const aiMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponseContent.trim(),
      timestamp: new Date()
    };

    const chatSession = new ChatModel({
      sessionId,
      messages: [userMessage, aiMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await chatSession.save();

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        aiResponse: aiMessage
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

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    await ChatModel.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All chat history cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear chat history'
    }, { status: 500 });
  }
}