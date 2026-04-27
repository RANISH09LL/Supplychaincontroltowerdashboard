// src/app/components/AIChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, MessageSquare, User } from 'lucide-react';
import { createChatSession, isAIEnabled } from '../../services/aiService';
import { useDashboard } from '../DashboardContext';

type ChatMessage = { role: 'user' | 'model'; text: string };

export function AIChat() {
  const { shipments, alerts, recommendations } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && !chatSession && isAIEnabled) {
      // Simplified context to avoid token limits
      const contextData = {
        shipments: shipments.map(s => ({ code: s.shipment_code, status: s.status, origin: s.origin, destination: s.destination, risk: s.risk_score, eta: s.eta })),
        alerts: alerts.map(a => ({ message: a.message, severity: a.severity })),
        recommendations: recommendations.map(r => ({ action: r.action_type, desc: r.description }))
      };
      
      const session = createChatSession(contextData);
      setChatSession(session);
      
      setMessages([
        { role: 'model', text: 'Hello! I am your Supply Chain Assistant. I have analyzed your dashboard data. How can I help you today?' }
      ]);
    }
  }, [isOpen, chatSession, shipments, alerts, recommendations]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !chatSession) return;

    const userQuery = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const result = await chatSession.sendMessage(userQuery);
      const text = await result.response.text();
      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setLoading(false);
    }
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
    <div className="fixed bottom-6 right-6 w-[380px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-foreground" />
          <span className="text-[14px] text-primary-foreground font-display font-bold">Gemini Assistant</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Response Area */}
      <div className="flex-1 p-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-muted/5 flex flex-col gap-4">
        {!isAIEnabled && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm border border-destructive/20 text-center">
            AI is offline. Please provide a Gemini API Key in your .env file.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground'}`}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-white border border-border text-foreground rounded-tl-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start flex-col">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                <Bot size={12} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Assistant</span>
            </div>
            <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[42px]">
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-white">
        <div className="relative flex items-center gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAIEnabled ? "Ask about your shipments..." : "AI offline"}
            disabled={!isAIEnabled || loading}
            className="flex-1 pl-3 pr-2 py-2.5 bg-muted/20 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim() || !isAIEnabled}
            className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
