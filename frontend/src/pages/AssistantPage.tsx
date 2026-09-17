import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Send,
  User as UserIcon,
  Bot,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Receipt,
  Wallet,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${user?.full_name || 'Alex'}! I am **SmartBank Assistant**, your AI financial co-pilot. I am connected directly to your accounts, budgets, and transaction records.\n\nWhat would you like to know about your money today?`,
      suggested_actions: [
        'How much did I spend on Food this month?',
        'What is my single biggest expense?',
        'How much did I save this month?',
        'Do I have any potential anomaly alerts?',
        'Can I afford a ₹15,000 purchase?',
        'What are my recurring monthly subscriptions?',
      ],
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await api.chatAssistant(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        grounded_data: response.grounded_data,
        suggested_actions: response.suggested_actions,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue querying your financial records. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { text: 'Food spending this month', icon: Receipt },
    { text: 'What is my biggest expense?', icon: TrendingUp },
    { text: 'How much did I save?', icon: Wallet },
    { text: 'Check anomaly alerts', icon: ShieldAlert },
    { text: 'Can I afford ₹15,000?', icon: Sparkles },
    { text: 'My recurring subscriptions', icon: CheckCircle2 },
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* Top Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              SmartBank Assistant
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Grounded Intelligence
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Direct access to your live transactions, balances, and budgets
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Zero Hallucination Mode</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20 rounded-tr-none'
                  : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}
            >
              {/* Message text with basic markdown styling */}
              <div className="space-y-2 whitespace-pre-line font-sans">
                {msg.text.split('\n').map((line, lIdx) => {
                  // highlight bold text
                  if (line.startsWith('•')) {
                    return (
                      <div key={lIdx} className="pl-2 text-slate-300 font-medium">
                        {line}
                      </div>
                    );
                  }
                  return <p key={lIdx}>{line}</p>;
                })}
              </div>

              {/* Suggested action chips */}
              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-cyan-400 block mb-2">
                    Quick inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-cyan-500/40 transition-all flex items-center gap-1"
                      >
                        {act} <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0 mt-1">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Querying your live banking database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Prompts:</span>
        {samplePrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.text)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" /> {p.text}
            </button>
          );
        })}
      </div>

      {/* Bottom Message Input Box */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything about your transactions, budgets, savings, or spending..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
