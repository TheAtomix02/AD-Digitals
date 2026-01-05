"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Database, Lock, Unlock, Globe, CheckCircle, Terminal, 
  Settings, Target, Zap, CornerDownRight, LayoutGrid
} from 'lucide-react';

const DEFAULT_GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY || ""; 
const DEFAULT_N8N_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "";

const generateId = () => `SESSION_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

const processIntelligence = async (message, currentDna, config) => {
  const { n8nUrl, geminiKey } = config;
  const payload = { message, session_id: currentDna.session_id, dna_snapshot: currentDna };

  if (n8nUrl) {
    try {
      const res = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) { console.warn("Switching to Local Neural Core."); }
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Analyze this business: ${message}. DNA State: ${JSON.stringify(currentDna)}. Output JSON: {"response": "", "dna_update": {}}` }] }] })
    });
    const data = await res.json();
    return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, ''));
  } catch (err) { return { response: "Connection Error.", dna_update: {} }; }
};

export default function AdDigitalsApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [dna, setDna] = useState({ session_id: generateId(), niche: null, target_audience: null, pricing_model: null, usp: null, acquisition_channel: null });
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const result = await processIntelligence(userMsg.text, dna, { n8nUrl: DEFAULT_N8N_URL, geminiKey: DEFAULT_GEMINI_KEY });
    if (result.dna_update) setDna(prev => ({ ...prev, ...result.dna_update }));
    setMessages(prev => [...prev, { sender: 'ai', text: result.response }]);
    setIsTyping(false);
  };

  const integrity = Math.round((Object.values(dna).filter(v => v && v !== dna.session_id).length / 5) * 100);

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-300">
      <div className="w-16 border-r border-zinc-900 flex flex-col items-center py-6 gap-6">
        <div className="w-8 h-8 bg-[#FDBD01] text-black flex items-center justify-center font-bold">AD</div>
        <Terminal className="text-[#FDBD01]" size={20} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-zinc-900 flex items-center px-6 justify-between text-xs font-mono">
          <span className="text-[#FDBD01]">SESSION: {dna.session_id}</span>
          <span>SYSTEM READY</span>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 max-w-[80%] text-sm ${m.sender === 'user' ? 'bg-zinc-900 border-r-2 border-[#FDBD01]' : 'border-l-2 border-[#FDBD01] bg-[#FDBD01]/5 text-[#FDBD01]'}`}>{m.text}</div>
            </div>
          ))}
          {isTyping && <div className="text-[#FDBD01] animate-pulse text-xs">ANALYZING...</div>}
          <div ref={scrollRef} />
        </div>
        <div className="p-6 border-t border-zinc-900 flex gap-4">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-black border border-zinc-800 p-4 text-sm outline-none focus:border-[#FDBD01]" placeholder="Enter directives..." />
          <button onClick={handleSend} className="w-16 bg-[#FDBD01] text-black flex items-center justify-center"><CornerDownRight size={24} /></button>
        </div>
      </div>

      <div className="w-80 border-l border-zinc-900 bg-[#080808] p-6">
        <h2 className="text-xs font-bold mb-8 uppercase flex items-center gap-2"><Database size={14} className="text-[#FDBD01]" /> Business DNA</h2>
        <div className="mb-8">
          <div className="flex justify-between text-[10px] mb-2 text-zinc-500 font-bold"><span>Integrity</span><span>{integrity}%</span></div>
          <div className="h-1 bg-zinc-900"><div className="h-full bg-[#FDBD01] transition-all" style={{width: `${integrity}%`}}></div></div>
        </div>
        {['niche', 'target_audience', 'pricing_model', 'usp', 'acquisition_channel'].map(field => (
          <div key={field} className="mb-4">
            <div className="text-[10px] uppercase text-zinc-500 mb-1">{field.replace('_', ' ')}</div>
            <div className={`text-sm py-2 border-b ${dna[field] ? 'border-[#FDBD01] text-white' : 'border-zinc-800 text-zinc-700'}`}>{dna[field] || "Awaiting Data..."}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
