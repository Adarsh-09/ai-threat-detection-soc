import { useState, useRef, useEffect, useCallback } from 'react';
import { sendAriaMessage, clearAriaSession, AriaMessage, DashboardContext } from '../../api/ariaApi';

interface AriaChatbotProps {
  dashboardContext?: DashboardContext;
}

const SESSION_ID = `aria-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const QUICK_PROMPTS = [
  { label: '🛡️ What is DoS?', message: 'What is a DoS attack and how does this dashboard detect it?' },
  { label: '🔍 Explain SHAP', message: 'How do I read SHAP values on this dashboard?' },
  { label: '⚠️ Zero-Day?', message: 'What is a Zero-Day alert and what should I do?' },
  { label: '👥 UBA Guide', message: 'How does the UBA module work?' },
];

export function AriaChatbot({ dashboardContext }: AriaChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AriaMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello, Analyst. I'm **ARIA**, your SOC intelligence assistant. I can help you analyze threats, interpret SHAP values, understand attack classifications, and guide incident response.\n\nWhat would you like to investigate?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: AriaMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendAriaMessage(text.trim(), SESSION_ID, dashboardContext);
      if (response.success && response.data) {
        const assistantMsg: AriaMessage = {
          id: `aria-${Date.now()}`,
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (!isOpen) setHasUnread(true);
      } else {
        const errorMsg: AriaMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ ' + (response.error || 'Something went wrong. Please try again.'),
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: AriaMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Could not reach ARIA backend. Make sure Flask is running on port 5000.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    await clearAriaSession(SESSION_ID);
    setMessages([
      {
        id: 'welcome-new',
        role: 'assistant',
        content: "Session cleared. I'm ready for a fresh analysis. What would you like to investigate?",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Simple markdown-ish rendering for bold and bullet points
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold: **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-cyan-300 font-bold">{part.slice(2, -2)}</strong>;
        }
        // Inline code: `text`
        const codeParts = part.split(/(`[^`]+`)/g);
        return codeParts.map((cp, k) => {
          if (cp.startsWith('`') && cp.endsWith('`')) {
            return <code key={`${j}-${k}`} className="bg-cyan-900/40 text-cyan-300 px-1 rounded text-[11px] font-mono">{cp.slice(1, -1)}</code>;
          }
          return <span key={`${j}-${k}`}>{cp}</span>;
        });
      });

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} className="flex gap-1.5 ml-2 mt-0.5"><span className="text-cyan-500 shrink-0">▸</span><span>{rendered}</span></div>;
      }
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      return <div key={i}>{rendered}</div>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="aria-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))' }}
      >
        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-800 border-2 border-gray-600 rotate-0'
            : 'bg-gradient-to-br from-cyan-600 to-blue-700 border-2 border-cyan-400/50 hover:scale-110'
        }`}>
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative">
              {/* ARIA icon — shield with circuit lines */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8V5M12 14v3M9 11H6M15 11h3" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
              </svg>
            </div>
          )}

          {/* Pulse ring animation */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30" />
          )}

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse" />
          )}
        </div>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 border border-cyan-500/30 rounded-lg text-cyan-400 text-[11px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ARIA — SOC Assistant
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          id="aria-chat-window"
          className="fixed bottom-24 right-6 z-50 flex flex-col"
          style={{
            width: '400px',
            height: '560px',
            animation: 'ariaSlideIn 0.3s ease-out',
          }}
        >
          {/* Glass container */}
          <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,10,20,0.97) 0%, rgba(0,20,30,0.97) 50%, rgba(0,10,25,0.97) 100%)',
              boxShadow: '0 0 40px rgba(0, 200, 255, 0.1), 0 0 80px rgba(0, 100, 200, 0.05), inset 0 1px 0 rgba(0, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20"
              style={{
                background: 'linear-gradient(90deg, rgba(0,50,60,0.5) 0%, rgba(0,30,40,0.5) 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* ARIA Avatar */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #0e7490 0%, #164e63 100%)',
                      boxShadow: '0 0 12px rgba(0, 200, 255, 0.3)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-cyan-200">
                      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 8V5M12 14v3M9 11H6M15 11h3" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900" />
                </div>
                <div>
                  <div className="text-cyan-300 text-sm font-bold font-mono tracking-wider">ARIA</div>
                  <div className="text-gray-500 text-[10px] font-mono">SOC Intelligence Assistant</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg hover:bg-cyan-900/30 text-gray-500 hover:text-cyan-400 transition-all"
                  title="Clear chat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#164e63 transparent',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                    {/* Message bubble */}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-cyan-700/30 border border-cyan-600/30 text-cyan-100 rounded-br-md'
                          : 'bg-gray-800/60 border border-gray-700/40 text-gray-200 rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                    </div>
                    <div className={`text-[9px] text-gray-600 mt-1 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/60 border border-gray-700/40 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.message)}
                      className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-cyan-900/20 border border-cyan-700/30 text-cyan-400 hover:bg-cyan-800/30 hover:border-cyan-500/50 transition-all whitespace-nowrap"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-3 py-3 border-t border-cyan-500/15"
              style={{ background: 'rgba(0, 20, 30, 0.5)' }}
            >
              <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700/50 rounded-xl px-3 py-1 focus-within:border-cyan-500/50 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask ARIA about threats..."
                  className="flex-1 bg-transparent text-gray-200 text-[12px] font-mono placeholder-gray-600 outline-none py-1.5"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 disabled:opacity-30 disabled:hover:bg-cyan-600/20 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
              <div className="text-center mt-1.5">
                <span className="text-[9px] text-gray-600 font-mono">ARIA v1.0 • Powered by Gemini</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes injected inline */}
      <style>{`
        @keyframes ariaSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
