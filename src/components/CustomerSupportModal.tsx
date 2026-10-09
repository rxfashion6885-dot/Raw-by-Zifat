import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext.js';
import { api } from '../services/api.js';
import {
  X,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Bot,
  User,
  Loader2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  text: string;
  isAdminTrigger?: boolean;
  adminLoginUrl?: string;
}

export const CustomerSupportModal: React.FC = () => {
  const { isSupportOpen, closeSupport } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: 'Hello! Welcome to RAW BY ZIFAT Support. Ask me anything about our clothing collections, sizing, delivery charges, Cash on Delivery, or tracking your parcel.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isSupportOpen) {
      scrollToBottom();
    }
  }, [messages, isSupportOpen]);

  if (!isSupportOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const trimmedQuery = (textToSend || input).trim();
    if (!trimmedQuery || isSending) return;

    // Check for secret admin command /rawadmin
    const lowerCommand = trimmedQuery.toLowerCase();
    if (lowerCommand === '/rawadmin' || lowerCommand === 'rawadmin') {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmedQuery,
      };

      const adminBotMsg: ChatMessage = {
        id: `bot-admin-${Date.now()}`,
        role: 'assistant',
        text: '⚡ [ADMIN ACCESS GRANTED]\n\nSecret authorization recognized! Unlocking Admin Panel...\nRedirecting you to the Admin Panel now.',
        isAdminTrigger: true,
        adminLoginUrl: '/rawbyzifat',
      };

      setMessages((prev) => [...prev, userMsg, adminBotMsg]);
      setInput('');
      setIsSending(false);

      // Auto redirect after 1.2 seconds
      setTimeout(() => {
        closeSupport();
        window.location.href = '/rawbyzifat';
      }, 1200);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedQuery,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await api.chatSupport(trimmedQuery, history);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: response.reply,
        isAdminTrigger: response.isAdminTrigger,
        adminLoginUrl: response.adminLoginUrl || '/rawbyzifat',
      };

      setMessages((prev) => [...prev, botMsg]);

      if (response.isAdminTrigger) {
        setTimeout(() => {
          closeSupport();
          window.location.href = response.adminLoginUrl || '/rawbyzifat';
        }, 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          text: 'We are experiencing high traffic. Delivery is ৳60 in Dhaka, ৳120 outside Dhaka, and free over ৳2,500. You can reach our hotline at +880 1712-345678.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'What is your delivery charge?',
    'Do you have Cash on Delivery?',
    'How do I pay with bKash / Nagad?',
    'Where is my order?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg h-[620px] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">RAW BY ZIFAT SUPPORT</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">Instant AI & Store Help</p>
            </div>
          </div>
          <button
            onClick={closeSupport}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-neutral-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-neutral-900 text-white rounded-tr-xs'
                    : 'bg-white text-neutral-900 border border-neutral-200/80 shadow-xs rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.isAdminTrigger && (
                  <div className="mt-4 pt-3 border-t border-neutral-200">
                    <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Security Portal Unlocked</span>
                    </div>
                    <a
                      href={m.adminLoginUrl || '/rawbyzifat'}
                      onClick={() => closeSupport()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-950 text-white text-xs font-black rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95"
                    >
                      <span>Admin Panel-e Jan (Open Admin Panel)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </a>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 items-center text-neutral-500 text-xs pl-2">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="bg-white border border-neutral-200 px-3 py-2 rounded-xl text-neutral-600 font-medium">
                RAW BY ZIFAT Assistant is typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 bg-white border-t border-neutral-100 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors font-medium border border-neutral-200/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-4 bg-white border-t border-neutral-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about sizing, delivery, COD..."
              className="flex-1 px-4 py-3 bg-neutral-100 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-3 bg-neutral-950 text-white rounded-2xl hover:bg-neutral-800 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
