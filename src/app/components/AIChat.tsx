// src/app/components/AIChat.tsx
import React, { useState } from 'react';
import { Send, Bot, X, MessageSquare } from 'lucide-react';
import { askAssistant } from '../../services/aiService';
import { useDashboard } from '../DashboardContext';

export function AIChat() {
  const { shipments, alerts, recommendations } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // Provide a summary of the dashboard as context
    const contextData = {
      summary: {
        total_shipments: shipments.length,
        at_risk: shipments.filter(s => s.status === 'at_risk').length,
        delayed: shipments.filter(s => s.status === 'delayed').length,
        active_alerts: alerts.length,
        top_recommendation: recommendations[0]?.description
      }
    };

    const aiResponse = await askAssistant(query, contextData);
    setResponse(aiResponse);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 px-3 py-1 bg-foreground text-background text-[11px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
          Ask Gemini Assistant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-foreground" />
          <span className="text-[14px] text-primary-foreground font-display font-bold">Gemini Logistics AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Response Area */}
      <div className="flex-1 p-4 min-h-[150px] max-h-[300px] overflow-y-auto bg-muted/5">
        {response ? (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-wider">Assistant</p>
            <p className="text-[13px] text-foreground font-medium leading-relaxed bg-white p-3 rounded-lg border border-border shadow-sm">
              {response}
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <Bot className="w-10 h-10 mb-2" />
            <p className="text-[12px] font-medium italic">How can I help you today?</p>
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 mt-4 text-primary animate-pulse">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animation-delay-200" />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animation-delay-400" />
            <span className="text-[11px] font-bold">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-white">
        <div className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about risks, status..."
            className="w-full pl-3 pr-10 py-2.5 bg-muted/20 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-md disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
