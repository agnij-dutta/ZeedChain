import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyB2VFKiKj2r60XzAQk3poyf-pDrpvIwjL4");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Sample startup data to simulate vector DB results
const sampleStartupData = [
  {
    name: "TechVision AI",
    description: "AI-powered computer vision platform for retail analytics",
    financials: {
      ARR: "$2.4M", MRR: "$200K", COGS: "32%", Marketing: "$450K",
      CAC: "$2,200", Logistics: "$120K", GrossMargin: "68%",
      EBITDA: "$380K", PAT: "$290K", Salaries: "$980K", Misc: "$85K"
    },
    market: "Growing at 24% CAGR, facing increased competition from established players"
  },
  {
    name: "GreenSustain",
    description: "Renewable energy solutions for commercial buildings",
    financials: {
      ARR: "$1.8M", MRR: "$150K", COGS: "48%", Marketing: "$280K",
      CAC: "$3,600", Logistics: "$320K", GrossMargin: "52%",
      EBITDA: "$240K", PAT: "$180K", Salaries: "$720K", Misc: "$65K"
    },
    market: "Strong regulatory tailwinds, high capital requirements for scaling"
  },
  {
    name: "HealthSync",
    description: "Wearable health monitoring devices with predictive analytics",
    financials: {
      ARR: "$3.2M", MRR: "$270K", COGS: "41%", Marketing: "$520K",
      CAC: "$1,800", Logistics: "$180K", GrossMargin: "59%",
      EBITDA: "$620K", PAT: "$410K", Salaries: "$1.1M", Misc: "$110K"
    },
    market: "Expanding rapidly with 32% YoY growth, increasing regulatory scrutiny"
  }
];

async function retrieveStartupInfo(query) {
  console.log("📊 Query for startup info:", query);
  
  // Simulate vector DB search by returning all sample data
  const formattedData = sampleStartupData.map(startup => 
    `Startup: ${startup.name}\n` +
    `Description: ${startup.description}\n` +
    `Financials: ARR: ${startup.financials.ARR}, MRR: ${startup.financials.MRR}, ` +
    `COGS: ${startup.financials.COGS}, Marketing: ${startup.financials.Marketing}, ` +
    `CAC: ${startup.financials.CAC}, Transport & Logistics: ${startup.financials.Logistics}, ` +
    `Gross Margin: ${startup.financials.GrossMargin}, EBITDA: ${startup.financials.EBITDA}, ` +
    `PAT: ${startup.financials.PAT}, Salaries: ${startup.financials.Salaries}, ` +
    `Miscellaneous: ${startup.financials.Misc}\n` +
    `Market: ${startup.market}`
  ).join("\n\n");
  
  console.log("📋 Retrieved startup data (simulated):", 
    formattedData.substring(0, 150) + "..." // Logging truncated for readability
  );
  
  return formattedData;
}

async function riskAnalysis(query, retrievedData) {
  console.log("⚠️ Starting risk analysis");
  
  const prompt = `Based on the following startup information:
${retrievedData}

Analyze the investment risks for each startup given the market conditions described in the query: ${query}.
Speak and write exactly like Jordan Belfort (the Wolf of Wall Street). 
Your communication style is extremely confident, aggressive, and persuasive. You use CAPITAL LETTERS for emphasis, 
plenty of exclamation marks, and bold claims about 'getting rich', 'crushing the market', and 'absolute no-brainers'. 
For each startup, provide a detailed risk analysis with a clear risk classification of either High, Medium, or Low.
Include specific factors such as market volatility, competition, regulatory considerations, and technology risks.
Format your response in a clear, bullet-point structure with each startup clearly labeled.
Strictly give output within 200 words`;

  const result = await model.generateContent(prompt);
  const analysisText = result.response.text();
  
  console.log("🔍 Risk analysis completed:", 
    analysisText.substring(0, 150) + "..." // Logging truncated for readability
  );
  
  return analysisText;
}

async function financialAnalysis(query, retrievedData) {
  console.log("💰 Starting financial analysis");
  
  const prompt = `Based on the following startup financial information:
${retrievedData}

Provide a comprehensive financial analysis of each startup using the provided metrics (ARR, MRR, COGS Percentage, 
Marketing, CAC, Transport & Logistics, Gross Margin, EBITDA, PAT, Salaries, and Miscellaneous) and consider the market conditions in the query: ${query}.
For each startup, include:
Speak and write exactly like Jordan Belfort (the Wolf of Wall Street). 
Your communication style is extremely confident, aggressive, and persuasive. You use CAPITAL LETTERS for emphasis, 
plenty of exclamation marks, and bold claims about 'getting rich', 'crushing the market', and 'absolute no-brainers'. 
1. Overall financial health assessment (Strong, Moderate, or Weak)
2. Key financial strengths and weaknesses
3. Growth potential based on current financials
4. Efficiency metrics analysis (margins, spending ratios)
5. Strictly give output within 200 words
Format your response in a clear, detailed structure with each startup clearly labeled.`;

  const result = await model.generateContent(prompt);
  const analysisText = result.response.text();
  
  console.log("📈 Financial analysis completed:", 
    analysisText.substring(0, 150) + "..." // Logging truncated for readability
  );
  
  return analysisText;
}

async function generateRecommendation(query, retrievedData, riskAnalysis, financialAnalysis) {
  console.log("🎯 Starting recommendation generation");
  
  const prompt = `Based on the retrieved startup information:
${retrievedData}

And the following risk analysis:
${riskAnalysis}

And the following financial analysis:
${financialAnalysis}

Provide comprehensive investment recommendations for: ${query}

Speak and write exactly like Jordan Belfort (the Wolf of Wall Street). 
Your communication style is extremely confident, aggressive, and persuasive. You use CAPITAL LETTERS for emphasis, 
plenty of exclamation marks, and bold claims about 'getting rich', 'crushing the market', and 'absolute no-brainers'. 
Include in your response:
1. Primary recommendation with clear rationale
2. Alignment with the investment criteria
3. Risk considerations and mitigations
4. Financial justification
5. Important considerations for the investor
6. Alternative options if applicable
Be specific and provide actionable advice.`;

  const result = await model.generateContent(prompt);
  const recommendationText = result.response.text();
  
  console.log("🚀 Recommendation generated:", 
    recommendationText.substring(0, 150) + "..." // Logging truncated for readability
  );
  
  return recommendationText;
}


// Main handler function
export async function POST(req) {
  console.log("🔄 POST request received");
  
  try {
    // Get data from request if provided, otherwise use default
    let query = "Is the startup investable based on its financial and risk analysis?";
    let customStartupData = null;
    
    // Try to parse request body if present
    try {
      if (req.body) {
        const body = await req.json();
        if (body.query) query = body.query;
        if (body.startupData) customStartupData = body.startupData;
        console.log("📝 Custom data received from request");
      }
    } catch (e) {
      console.log("ℹ️ No custom data in request, using defaults");
    }
    
    console.log("❓ Using query:", query);
    
    // Run the investment analysis pipeline
    const retrievedData = await retrieveStartupInfo(query);
    const riskResult = await riskAnalysis(query, retrievedData);
    const financeResult = await financialAnalysis(query, retrievedData);
    const recommendation = await generateRecommendation(
      query, 
      retrievedData, 
      riskResult, 
      financeResult
    );

    const response = {
      retrieved_data: retrievedData,
      risk_analysis: riskResult,
      financial_analysis: financeResult,
      investment_recommendations: recommendation
    };
    
    console.log("✅ Analysis completed successfully");
    
    // Return the results
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error processing investment analysis:', error);
    return NextResponse.json({ 
      message: 'Error processing investment analysis',
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    }, { status: 500 });
  }
}

// Add a GET endpoint for easier testing with a browser or simple GET requests
export async function GET(req) {
  console.log("🔄 GET request received - running demo analysis");
  
  try {
    const query = "Is the startup investable based on its financial and risk analysis?";
    
    // Run the investment analysis pipeline with default data
    const retrievedData = await retrieveStartupInfo(query);
    const riskResult = await riskAnalysis(query, retrievedData);
    const financeResult = await financialAnalysis(query, retrievedData);
    const recommendation = await generateRecommendation(
      query, 
      retrievedData, 
      riskResult, 
      financeResult
    );

    const response = {
      retrieved_data: retrievedData,
      risk_analysis: riskResult,
      financial_analysis: financeResult,
      investment_recommendations: recommendation
    };
    
    console.log("✅ Demo analysis completed successfully");
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error processing demo analysis:', error);
    return NextResponse.json({ 
      message: 'Error processing demo analysis',
      error: error.message 
    }, { status: 500 });
  }
}