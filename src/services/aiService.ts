// src/services/aiService.ts
// ============================================================
// AI SERVICE — Groq API with Google Gemma 2 (Free, no billing)
// ============================================================

import type { Shipment, Recommendation, Simulation } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // reusing same env var
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Meta Llama 3.3 70B on Groq (free)

export const isAIEnabled = !!GROQ_API_KEY;

// ─── Core helper ─────────────────────────────────────────────

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  if (!GROQ_API_KEY) return 'AI insights currently unavailable. Please add a GROQ API key.';

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 256,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Groq API error:', err);
      return 'AI insight temporarily unavailable.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || 'No insight generated.';
  } catch (error) {
    console.error('Groq fetch error:', error);
    return 'Error generating AI insight.';
  }
}

// ─── Generic helper (backwards-compatible) ──────────────────

export async function getGeminiResponse(systemPrompt: string, userContent: any): Promise<string> {
  return callGroq(systemPrompt, JSON.stringify(userContent));
}

// ─── Shipment risk explanation ───────────────────────────────

export async function generateRiskExplanation(shipment: Shipment): Promise<string> {
  if (!isAIEnabled) return 'High congestion and delay patterns detected on this route.';

  const systemPrompt = 'You are a logistics risk analyst. In one short sentence, explain why this shipment is at risk based on the data provided.';
  const userMessage = `Shipment: ${shipment.shipment_code}, Origin: ${shipment.origin}, Destination: ${shipment.destination}, Risk Score: ${shipment.risk_score}/100, Status: ${shipment.status}`;

  const response = await callGroq(systemPrompt, userMessage);
  return response.includes('unavailable') || response.includes('Error')
    ? 'High congestion and delay patterns detected on this route.'
    : response;
}

// ─── Recommendation explanation ─────────────────────────────

export async function generateRecommendationExplanation(recommendation: Recommendation): Promise<string> {
  if (!isAIEnabled) return 'Recommended route reduces exposure to high-risk regions.';

  const systemPrompt = 'Explain the business value of this supply chain recommendation in one sentence focusing on cost, risk, or speed.';
  const userMessage = `Action: ${recommendation.action_type}, Risk reduced from ${recommendation.risk_before} to ${recommendation.risk_after}, ETA change: ${recommendation.eta_change}h, Cost impact: $${recommendation.cost_impact}`;

  const response = await callGroq(systemPrompt, userMessage);
  return response.includes('unavailable') || response.includes('Error')
    ? 'Recommended route reduces exposure to high-risk regions.'
    : response;
}

// ─── Simulation insight ──────────────────────────────────────

export async function generateSimulationInsight(simulation: Simulation): Promise<string> {
  if (!isAIEnabled) return 'Simulation shows potential bottleneck in current routing structure.';

  const systemPrompt = 'Analyze this supply chain simulation and identify the biggest risk or failure point in one sentence.';
  const userMessage = `Simulation type: ${simulation.type}, Impact factor: ${simulation.impact_factor}`;

  const response = await callGroq(systemPrompt, userMessage);
  return response.includes('unavailable') || response.includes('Error')
    ? 'Simulation shows potential bottleneck in current routing structure.'
    : response;
}

// ─── Chat session (conversational) ──────────────────────────

export type GroqMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export function createChatSession(contextData: any) {
  const systemPrompt = `You are a Supply Chain Assistant for the Supply Chain Control Tower dashboard.
Help the user analyze their supply chain data and answer questions about specific shipments, alerts, or recommendations.
Be professional, concise, and helpful (2-4 sentences max per response).

LIVE DASHBOARD DATA:
${JSON.stringify(contextData, null, 2)}`;

  const history: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  return {
    history,
    async sendMessage(userText: string): Promise<{ response: { text: () => string } }> {
      history.push({ role: 'user', content: userText });

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: history,
          max_tokens: 512,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || 'Groq API error');
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim() || 'No response generated.';

      history.push({ role: 'assistant', content: text });

      return { response: { text: () => text } };
    }
  };
}
