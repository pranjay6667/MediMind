import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, AlertTriangle, Sparkles, Trash2, Activity, Pill } from 'lucide-react';
import { Medicine, IntakeLog, LogStatus } from '../types';
import { analyzeInteractions, chatWithHealthBot } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  medicines: Medicine[];
  logs: IntakeLog[];
  userName?: string;
}

const AIChat: React.FC<AIChatProps> = ({ medicines, logs, userName }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: `Hello ${userName || 'there'}! I'm your MediMind health assistant. I can analyze your medication schedule, check for interactions, or give health tips based on your history. How can I help?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const generateContext = () => {
    const medList = medicines.length > 0 
      ? medicines.map(m => `- ${m.name} (${m.dosage}, ${m.frequency} at ${m.time}): ${m.notes || 'No notes'}`).join('\n')
      : "No active medications.";

    // Calculate basic stats
    const last7Days = logs.filter(l => l.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000);
    const takenCount = last7Days.filter(l => l.status === LogStatus.TAKEN).length;
    const skippedCount = last7Days.filter(l => l.status === LogStatus.SKIPPED).length;
    const adherenceRate = (takenCount + skippedCount) > 0 ? Math.round((takenCount / (takenCount + skippedCount)) * 100) : 0;

    return `
      Patient Name: ${userName || 'User'}
      
      Current Medication Schedule:
      ${medList}
      
      Adherence History (Last 7 Days):
      - Doses Logged: ${takenCount + skippedCount}
      - Taken: ${takenCount}
      - Skipped: ${skippedCount}
      - Estimated Adherence Rate: ${adherenceRate}%
    `;
  };

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim() || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const contextData = generateContext();
    const response = await chatWithHealthBot(messages, userMsg, contextData);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: 'Chat cleared. How can I assist you with your health schedule today?' }]);
  };

  const suggestions = [
    { label: "Check Interactions", icon: <AlertTriangle size={14} />, action: () => handleSend("Check my current medicine list for interactions.") },
    { label: "My Adherence", icon: <Activity size={14} />, action: () => handleSend("Analyze my medication adherence over the last week. Am I consistent?") },
    { label: "Side Effects", icon: <Pill size={14} />, action: () => handleSend("What are the common side effects of my medicines?") },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] relative">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3 flex items-center justify-between transition-colors shrink-0">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 relative">
                <Bot size={20} />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">MediMind Assistant</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                   <Sparkles size={8} /> AI-Powered
                </p>
            </div>
        </div>
        <button 
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear Chat"
        >
            <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-1 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors ${
              msg.role === 'user' 
                ? 'bg-teal-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
            }`}>
              <ReactMarkdown 
                components={{
                    ul: ({node, ...props}) => <ul className="list-disc ml-4 my-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-teal-700 dark:text-teal-300" {...props} />
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex justify-start animate-fade-in">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length < 3 && !loading && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-1 shrink-0">
            {suggestions.map((s, i) => (
                <button 
                    key={i}
                    onClick={s.action}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full whitespace-nowrap border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                    {s.icon} {s.label}
                </button>
            ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 shrink-0 bg-gray-50 dark:bg-gray-900 pt-1">
        <input 
            type="text" 
            className="flex-1 p-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all shadow-sm text-sm"
            placeholder="Ask anything about your meds..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
        />
        <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
        >
            <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIChat;