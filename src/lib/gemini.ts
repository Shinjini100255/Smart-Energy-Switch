import { GoogleGenAI } from '@google/genai';
import { UserProfile, ChatMessage } from '../types';
import { getSettings } from './settings';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chatWithEnergyAdvisor = async (
  message: string,
  history: ChatMessage[],
  profile: UserProfile,
  reports: any[] = []
) => {
  const settings = getSettings();
  const language = settings.language;

  const reportsSummary = reports.length > 0 
    ? reports.map(r => `- ${r.title}: ${r.decision_summary}`).join('\n')
    : 'No previous reports saved.';

  const systemInstruction = `
You are an expert AI Energy Consultant for "SMART ENERGY SWITCH".
Your goal is to help users find alternative cooking solutions during LPG shortages.

====================================================
🧠 MEMORY & CONTEXT
====================================================
User Profile:
- Name: ${profile.name}
- Location: ${profile.location}
- Family Size: ${profile.familySize.adults} adults, ${profile.familySize.children} children
- Cooking Frequency: ${profile.cookingFrequency}
- Food Preference: ${profile.foodPreference}
- Electricity Availability: ${profile.electricityAvailability}
- Budget: ${profile.budget || 'Not specified'}

Previous Reports & Decisions:
${reportsSummary}

====================================================
🧠 MEMORY USAGE RULE
====================================================
Use the saved data intelligently:
- If family size exists → do not ask again.
- If electricity is "Poor" or "Average" → avoid induction; suggest Biogas, Solar, or Hybrid.
- If location exists → prioritize local vendors or rural-appropriate solutions (like Biogas for rural).
- If previous recommendation exists → acknowledge it and compare if relevant.
- Personalize every response using stored memory.

====================================================
🎯 AI BEHAVIOR RULES
====================================================
1. RESPONSIVENESS: Answer the user's specific questions directly.
2. ADAPTIVE RECOMMENDATIONS: Do NOT always recommend electric solutions.
3. CONVERSATIONAL: Be empathetic and smart. If the user's request is incomplete, ask a smart follow-up.
4. LANGUAGE: You MUST respond entirely in ${language}.
5. CONCISENESS: Use short sentences. No fluff.
6. AUTO-UPDATE DETECTION: If the user mentions a change in their budget, family size, location, or electricity, acknowledge it and explicitly state "I will update your profile."

====================================================
📥 OUTPUT FORMAT
====================================================
You MUST respond with a JSON object.
If asking a question or making conversation:
{
  "type": "text",
  "content": "Your concise response in ${language}."
}

If providing a recommendation:
{
  "type": "recommendation",
  "content": "Short recommendation summary in ${language}.",
  "recommendationData": {
    "solution": { "primary": "Name", "secondary": "Optional" },
    "applianceRecommendation": { "type": "Type", "powerRating": "Rating" },
    "priceBreakdown": { "initialCost": "₹X", "monthlyCost": "₹X", "maintenanceCost": "₹X", "estimatedSavings": "₹X" },
    "comparison": { "costDifference": "vs LPG", "efficiency": "%", "convenience": "Factor" },
    "advantages": ["Adv 1"], "disadvantages": ["Dis 1"],
    "whyBestForYou": "Reasoning based on profile",
    "whyNotOthers": "Rejection reason for others",
    "ecoFriendlyImpact": { "co2Reduction": "Xkg", "sustainabilityLevel": "High/Med/Low" },
    "confidenceScore": 95
  }
}
`;

  // Format history for Gemini
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.type === 'recommendation' ? JSON.stringify({ type: 'recommendation', recommendationData: msg.recommendationData }) : msg.content }]
  }));

  // Add current message
  formattedHistory.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: formattedHistory as any,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error in chat:", error);
    return {
      type: 'text',
      content: "I'm sorry, I'm having trouble connecting right now. Could you please try again?"
    };
  }
};

export const getGasFreeRecipes = async (
  ingredients: string,
  appliances: string,
  dietType: string
) => {
  const settings = getSettings();
  const language = settings.language;

  const prompt = `
    You are an expert chef specializing in emergency, gas-free cooking.
    The user has no LPG and needs quick recipes (10-15 mins).
    
    Available Ingredients: ${ingredients}
    Available Appliances: ${appliances}
    Diet Type: ${dietType}
    
    CRITICAL RULES:
    1. Do NOT always suggest induction. 
    2. You MUST adapt to the exact appliances provided by the user.
    3. You MUST respond entirely in ${language}.
    4. BE EXTREMELY CONCISE. Short titles, short steps.
    5. Speed is priority.
    
    Generate 3 quick recipes (10-15 mins) using ONLY the available appliances and ingredients.
    
    Return the response strictly as a JSON array:
    [
      {
        "title": "Short Name",
        "time": "10m",
        "steps": ["Step 1", "Step 2"],
        "appliance": "Appliance",
        "dietType": "Veg/Non-Veg"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [
      {
        title: "Quick Microwave Poha",
        time: "10 mins",
        steps: ["Wash poha and drain.", "Microwave oil, mustard seeds, peanuts for 2 mins.", "Add onions, turmeric, microwave for 2 mins.", "Mix poha, salt, microwave for 2 mins."],
        appliance: "Microwave",
        dietType: "Veg"
      }
    ];
  }
};
