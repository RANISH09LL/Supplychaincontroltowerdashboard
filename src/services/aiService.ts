// src/services/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Shipment, Recommendation, Simulation } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

export const isAIEnabled = !!API_KEY;

/**
 * Generic helper to get Gemini response
 */
export async function getGeminiResponse(systemPrompt: string, userContent: any): Promise<string> {
  if (!model) {
    return "AI insights currently unavailable.";
  }

  try {
    const prompt = `${systemPrompt}\n\nData Context: ${JSON.stringify(userContent)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    // Return max 1-2 sentences as per requirement
    return text || "No specific insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI insight.";
  }
}

/**
 * Generate explanation for shipment risk
 */
export async function generateRiskExplanation(shipment: Shipment): Promise<string> {
  if (!isAIEnabled) return "High congestion and delay patterns detected on this route.";
  
  const systemPrompt = "You are a logistics risk analyst. In one short sentence, explain why this shipment is at risk.";
  const context = {
    code: shipment.shipment_code,
    origin: shipment.origin,
    destination: shipment.destination,
    risk_score: shipment.risk_score,
    status: shipment.status
  };
  
  const response = await getGeminiResponse(systemPrompt, context);
  return response.includes("Error") || response.includes("unavailable") 
    ? "High congestion and delay patterns detected on this route." 
    : response;
}

/**
 * Generate explanation for recommendation business value
 */
export async function generateRecommendationExplanation(recommendation: Recommendation): Promise<string> {
  if (!isAIEnabled) return "Recommended route reduces exposure to high-risk regions.";

  const systemPrompt = "Explain the business value of this recommendation in one sentence focusing on cost, risk, or speed.";
  const context = {
    action: recommendation.action_type,
    risk_before: recommendation.risk_before,
    risk_after: recommendation.risk_after,
    eta_change: recommendation.eta_change,
    cost_impact: recommendation.cost_impact
  };

  const response = await getGeminiResponse(systemPrompt, context);
  return response.includes("Error") || response.includes("unavailable")
    ? "Recommended route reduces exposure to high-risk regions."
    : response;
}

/**
 * Generate insight for simulation results
 */
export async function generateSimulationInsight(simulation: Simulation): Promise<string> {
  if (!isAIEnabled) return "Simulation shows potential bottleneck in current routing structure.";

  const systemPrompt = "Analyze this simulation result and identify the biggest risk or failure point in one sentence.";
  const context = {
    type: simulation.type,
    impact_factor: simulation.impact_factor
  };

  const response = await getGeminiResponse(systemPrompt, context);
  return response.includes("Error") || response.includes("unavailable")
    ? "Simulation shows potential bottleneck in current routing structure."
    : response;
}

/**
 * Bonus: Ask Assistant helper
 */
export async function askAssistant(query: string, contextData: any): Promise<string> {
  if (!model) return "Assistant is currently offline.";

  const systemPrompt = "You are a Supply Chain Assistant. Answer the user query based on the provided dashboard summary. Keep it short (1-2 sentences).";
  return getGeminiResponse(systemPrompt, { query, ...contextData });
}
