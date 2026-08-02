import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Loader2, Shield, Globe, Mail, MessageSquare, RefreshCw } from 'lucide-react'
import { aiApi } from '@/api/endpoints'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const EXAMPLES = [
  "Why is this URL considered phishing?",
  "Explain what SPF failure means",
  "How should I respond to a phishing attack?",
  "What is DMARC and why does it matter?",
  "Generate a SOC incident report",
  "What is typosquatting?",
]

const MOCK_RESPONSES: Record<string, string> = {
  default: `I'm **VOID AI**, your phishing investigation assistant. I can help you:

- **Analyze** suspicious URLs, emails, domains, and SMS messages
- **Explain** security concepts like SPF, DKIM, DMARC, and phishing indicators
- **Generate** SOC reports and executive summaries
- **Map** attacks to MITRE ATT&CK techniques
- **Advise** on incident response and prevention

Ask me anything about your current scan or general threat intelligence!`,
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: MOCK_RESPONSES.default,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Pass null for scan_id and conversation_id for now as we don't have them in the chat context
      const res = await aiApi.chat(content)
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: res.content + `\n\n*Powered by VOID AI • ${res.model}*`, 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error(err)
      const errorMsg: Message = { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting to the AI service right now.", 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/`(.*?)`/g, '<code class="mono bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 text-xs">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Bot size={16} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Chat</h1>
            <p className="text-xs text-slate-500">Powered by LangChain + Threat Intelligence</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: 'assistant', content: MOCK_RESPONSES.default, timestamp: new Date() }])}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white glass rounded-lg border border-white/10 hover:border-white/20 transition-all"
        >
          <RefreshCw size={12} /> New conversation
        </button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 glass rounded-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-purple-500 to-blue-600'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600'
              }`}>
                {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
              </div>
              <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-white/5 text-slate-300 rounded-tl-sm'
                    : 'bg-cyan-500/15 text-slate-200 border border-cyan-500/20 rounded-tr-sm'
                }`}
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
                <p className="text-[10px] text-slate-600 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="text-purple-400 animate-spin" />
                <span className="text-sm text-slate-400">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Example prompts */}
        {messages.length <= 1 && (
          <div className="px-5 pb-4">
            <p className="text-xs text-slate-600 mb-2 font-medium uppercase tracking-wider">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => sendMessage(ex)}
                  className="text-xs px-3 py-1.5 rounded-full glass border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask about phishing indicators, SPF/DKIM/DMARC, or request a report..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white rounded-xl transition-all flex items-center justify-center flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
