import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { timeAgo } from '@/utils/constants'
import type { DbMessage, DbConversation } from '@/lib/supabase'

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()

  const [conv, setConv]         = useState<DbConversation | null>(null)
  const [messages, setMessages] = useState<DbMessage[]>([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id || !user) return

    Promise.all([
      supabase.from('conversations')
        .select('*, listing:listing_id(id,title,image_urls,image_url), buyer:buyer_id(id,display_name,avatar_url,photo_url), seller:seller_id(id,display_name,avatar_url,photo_url)')
        .eq('id', id).single(),
      supabase.from('messages')
        .select('*, sender:sender_id(id,display_name,avatar_url,photo_url)')
        .eq('conversation_id', id).order('created_at', { ascending: true }),
    ]).then(([{ data: c }, { data: m }]) => {
      setConv(c as DbConversation)
      setMessages((m as DbMessage[]) ?? [])
      setLoading(false)
    })

    // Realtime
    const channel = supabase.channel(`chat:${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${id}`,
      }, async ({ new: msg }) => {
        const { data: sender } = await supabase
          .from('users')
          .select('id,display_name,avatar_url,photo_url')
          .eq('id', (msg as DbMessage).sender_id)
          .single()

        // Fix: sender یا DbUser است یا undefined — هرگز null نیست
        const newMsg: DbMessage = {
          ...(msg as DbMessage),
          sender: sender ?? undefined,
        }
        setMessages(prev => [...prev, newMsg])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!conv || !user) return
    const field = conv.buyer_id === user.id ? 'buyer_unread' : 'seller_unread'
    supabase.from('conversations').update({ [field]: 0 }).eq('id', conv.id)
    supabase.from('messages').update({ read: true })
      .eq('conversation_id', conv.id).neq('sender_id', user.id)
  }, [conv, user])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user || !id || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      content,
    })
    if (!error) {
      await supabase.from('conversations').update({
        last_message_content: content,
        last_message_at: new Date().toISOString(),
      }).eq('id', id)
    }
    setSending(false)
  }

  const other = conv
    ? (conv.buyer_id === user?.id ? (conv as any).seller : (conv as any).buyer)
    : null
  const listing = (conv as any)?.listing

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--text-primary)] rounded-full animate-spin" />
    </div>
  )

  if (!conv) return (
    <div className="text-center py-20 text-[var(--text-muted)]">مکالمه پیدا نشد</div>
  )

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 60px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-color)] shrink-0">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]">
          <ChevronRight size={22} />
        </button>
        <div className="w-9 h-9 rounded-full bg-[var(--surface-color)] overflow-hidden shrink-0">
          {other?.avatar_url || other?.photo_url
            ? <img src={other.avatar_url ?? other.photo_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[var(--text-muted)]">
                {other?.display_name?.[0]}
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{other?.display_name}</p>
          {listing && (
            <Link to={`/listings/${listing.id}`} className="text-xs text-[var(--text-muted)] truncate block">
              {listing.title}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[var(--text-muted)] py-8">مکالمه را شروع کنید 👋</p>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMine && (
                <div className="w-7 h-7 rounded-full bg-[var(--surface-color)] overflow-hidden shrink-0 self-end">
                  {(msg.sender as any)?.avatar_url
                    ? <img src={(msg.sender as any).avatar_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                        {(msg.sender as any)?.display_name?.[0]}
                      </div>
                  }
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-[var(--text-primary)] text-[var(--bg-color)] rounded-tl-sm'
                    : 'bg-[var(--surface-color)] text-[var(--text-primary)] rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage}
        className="flex gap-2 px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-color)] shrink-0"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          maxLength={2000}
          className="flex-1 h-11 px-4 rounded-2xl bg-[var(--surface-color)] text-[var(--text-primary)] text-sm border border-[var(--border-color)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-11 h-11 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] flex items-center justify-center disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
