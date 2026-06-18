import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { callGroq } from '../lib/groq';
import { Send, Loader2, User, Bot } from 'lucide-react';

export default function SandboxView() {
  const { state } = useApp();
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !state.apiKey) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    const prompt = `You are a helpful tutor and technical adjudicator. The student is in a free-form AI sandbox. Respond helpfully and concisely.

Student: ${userMsg}

Tutor:`;
    const result = await callGroq(prompt, state.apiKey);
    setLoading(false);
    setMessages((prev) => [...prev, { role: 'model', text: result.error ? `Error: ${result.error}` : result.text }]);
  }, [input, state.apiKey]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>AI Sandbox</h1>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto mb-4 max-h-[60vh]">
        {messages.length === 0 && (
          <div className="text-center py-12 text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
            Ask anything about your current topic or any subject you are studying.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--accent-green)' }}>
              {msg.role === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color="#fff" />}
            </div>
            <div
              className="p-4 rounded-xl text-sm font-bold max-w-[80%]"
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-green)' }}>
              <Bot size={16} color="#fff" />
            </div>
            <div className="p-4 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}>
              <Loader2 size={16} className="animate-spin" />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={state.apiKey ? 'Ask anything...' : 'Add API key in Settings first'}
          disabled={!state.apiKey || loading}
          className="flex-1 p-4 rounded-xl border-2 text-sm font-bold outline-none transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', borderBottomWidth: '4px' }}
        />
        <button
          onClick={handleSend}
          disabled={!state.apiKey || loading || !input.trim()}
          className="duo-btn duo-btn-green px-4 h-12"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
