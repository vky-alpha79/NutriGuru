import { Leaf } from 'lucide-react'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Leaf className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'rounded-2xl rounded-br-sm bg-primary text-white'
              : 'rounded-2xl rounded-bl-sm border border-border bg-surface-0 text-text-primary'
          }`}
        >
          {content}
        </div>
        {timestamp && (
          <p className={`mt-1 text-xs text-text-muted ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}
