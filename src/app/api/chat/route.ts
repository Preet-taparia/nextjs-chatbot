import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { gemini } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import ChatModel from '@/models/chat';
import { Message, SendMessageRequest } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `You are the customer support AI assistant for TechInterview Pro, a SaaS platform that helps software engineers prepare for technical interviews. 

IMPORTANT: You should ONLY answer questions related to:
- TechInterview Pro platform features and services
- Technical interview preparation
- Our pricing plans and packages
- Platform usage and tutorials
- Account and billing questions
- Technical interview tips and best practices

If someone asks about topics unrelated to TechInterview Pro or technical interviews, politely redirect them back to our services.

Here's information about TechInterview Pro:

PLATFORM FEATURES:
- Live coding interview practice with real-time feedback
- Mock interview sessions with AI and human interviewers
- 1000+ curated technical questions across multiple domains
- Company-specific interview preparation (Google, Amazon, Microsoft, etc.)
- Progress tracking and performance analytics
- Code collaboration tools and whiteboards
- Video interview recording and playback
- Personalized study plans based on skill gaps

SUPPORTED TECHNOLOGIES:
- Programming Languages: JavaScript, Python, Java, C++, C#, Go, Rust
- Frontend: React, Angular, Vue.js, HTML/CSS
- Backend: Node.js, Django, Spring Boot, Express.js
- Databases: SQL, NoSQL, MongoDB, PostgreSQL
- System Design: Scalability, Microservices, Load Balancing
- Algorithms & Data Structures: Arrays, Trees, Graphs, Dynamic Programming

PRICING PLANS:
- Basic Plan: $29/month - 50 practice sessions, basic feedback
- Pro Plan: $59/month - Unlimited sessions, AI feedback, mock interviews
- Enterprise Plan: $99/month - Everything + human mentor sessions, company-specific prep

FEATURES BY PLAN:
Basic: Practice coding problems, basic hints, progress tracking
Pro: Everything in Basic + AI-powered feedback, system design prep, interview recordings
Enterprise: Everything in Pro + 1-on-1 mentor sessions, priority support, custom company prep

Be helpful, professional, and focus only on TechInterview Pro related topics. If asked about competitors, briefly acknowledge them but highlight our unique strengths.`;

export async function GET() {
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

    const sessionId = `techinterview_chat_${Date.now()}`;

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
    const conversationHistory = recentMessages.slice(-10).map((msg: Message) => ({
      role: msg.role,
      content: msg.content
    }));

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: userMessage.role as 'user',
        content: userMessage.content
      }
    ];

    const { textStream } = streamText({
      model: gemini('gemini-1.5-flash'),
      messages: messages,
      temperature: 0.3,
      maxTokens: 800,
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

export async function DELETE() {
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