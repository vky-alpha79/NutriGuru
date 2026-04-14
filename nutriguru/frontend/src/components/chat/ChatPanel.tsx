import { useState, useRef, useEffect } from 'react'
import { Send, Lock, Leaf } from 'lucide-react'
import ChatBubble from './ChatBubble'
import api from '../../lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Props {
  onMealGenerated?: (data: any) => void
}

export default function ChatPanel({ onMealGenerated }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm NutriGuru, your personal nutrition coach. Ask me anything about your diet plan, swap ingredients, or generate today's meals!",
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toLocaleTimeString() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const { data } = await api.post('/chat', {
        message: text,
        session_id: sessionId,
        history,
      })

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      if (data.meal_data && onMealGenerated) {
        onMealGenerated(data.meal_data)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date().toLocaleTimeString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface-0 rounded-xl border border-border">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Leaf className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">NutriGuru Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} timestamp={m.timestamp} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>NutriGuru is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-success">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">SECURE</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your diet plan..."
            className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:border-border-focus focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
