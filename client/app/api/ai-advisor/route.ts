// app/api/ai-advisor/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the incoming request
    const body = await request.json();
    const { message, history } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create a formatted conversation history for the AI
    const formattedHistory = history
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // Add the latest user message
    // Note: The latest message is already in history, but we're formatting it here for illustration
    
    // Replace this section with your actual AI provider integration
    // Example using OpenAI (you would need to install the openai package)
    /*
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are WallStreetAI, a financial advisor assistant." },
        ...formattedHistory
      ],
    });
    
    const aiResponse = completion.choices[0].message.content;
    */
    
    // For demonstration purposes, we're using a simulated response
    // In a real application, replace this with actual AI integration
    const aiResponse = simulateAIResponse(message);
    
    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      response: aiResponse,
    });
    
  } catch (error) {
    console.error('AI Advisor API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Function to generate simulated responses (replace with actual AI integration)
function simulateAIResponse(message) {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Simple pattern matching for demo purposes
  if (lowerMessage.includes('stock') || lowerMessage.includes('invest')) {
    return "When considering investments, it's important to diversify your portfolio. I recommend consulting with a financial advisor before making any investment decisions.";
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
    return "Market trends are constantly evolving. In the current market conditions, many analysts are suggesting cautious optimism with an emphasis on quality assets.";
  }
  
  if (lowerMessage.includes('crypto') || lowerMessage.includes('bitcoin')) {
    return "Cryptocurrency investments can be highly volatile. Only invest what you can afford to lose, and make sure to do thorough research on any crypto assets.";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm WallStreetAI, your financial assistant. How can I help with your investment questions today?";
  }
  
  // Default response
  return `Thanks for your query about "${message}". As a financial AI assistant, I can provide general guidance on investments and market trends, but remember that all investment decisions should be made after consulting with professional advisors.`;
}