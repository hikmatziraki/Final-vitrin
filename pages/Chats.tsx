import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MessageCircle, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { timeAgo } from '@/utils/constants'
import type { DbConversation } from '@/lib/supabase'

export default function Chats() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [convs, setConvs]     = useState<DbConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('conversations')
      .select('*, listing:listing_id(id,title,image_urls,image_url), buyer:buyer_id(id,display_name,avatar_url,photo_url), seller:seller_id(id,display_name,avatar_url,photo_url)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })
      .then(({ data }) => { setConvs((data as DbConversation[]) ?? []); setLoading(false) })
  }, [user])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22}/></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">پیام‌ها</h1>
      </div>

      <div className="pb-4">
        {loading
          ? Array.from({length:3}).map((_,i)=><div key={i} className="flex gap-3 px-4 py-3 animate-pulse"><div className="w-12 h-12 rounded-2xl bg-[var(--surface-color)]"/><div className="flex-1 space-y-2 py-1"><div className="h-3 bg-[var(--surface-color)] rounded w-1/2"/><div className="h-3 bg-[var(--surface-color)] rounded w-3/4"/></div></div>)
          : convs.length === 0
            ? <div className="text-center py-16"><MessageCircle size={48} className="mx-auto text-[var(--border-color)] mb-3"/><p className="text-[var(--text-muted)]">هیچ مکالمه‌ای وجود ندارد.</p></div>
            : convs.map(conv => {
                const other = conv.buyer_id === user!.id ? (conv as any).seller : (conv as any).buyer
                const unread = conv.buyer_id === user!.id ? conv.buyer_unread : conv.seller_unread
                const listing = (conv as any).listing
                return (
                  <button key={conv.id} onClick={() => navigate(`/chats/${conv.id}`)}
                    className="w-full flex gap-3 px-4 py-3 active:bg-[var(--surface-color)] transition-colors border-b border-[var(--border-color)] last:border-0">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] overflow-hidden shrink-0">
                      {other?.avatar_url || other?.photo_url
                        ? <img src={other.avatar_url ?? other.photo_url} alt={other.display_name} className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--text-muted)]">{other?.display_name?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{other?.display_name}</span>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">{timeAgo(conv.last_message_at)}</span>
                      </div>
                      {listing && <p className="text-[10px] text-[var(--text-muted)] truncate">درباره: {listing.title}</p>}
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-[var(--text-secondary)] truncate flex-1">{conv.last_message_content ?? 'مکالمه‌ای شروع نشده'}</p>
                        {unread > 0 && <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold shrink-0">{unread}</span>}
                      </div>
                    </div>
                  </button>
                )
              })
        }
      </div>
    </motion.div>
  )
}
