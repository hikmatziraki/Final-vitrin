import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Bell, ChevronRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { timeAgo } from '@/utils/constants'
import type { DbNotification } from '@/lib/supabase'

export default function Notifications() {
  const navigate = useNavigate()
  const { user, setUnreadCount } = useAppStore()
  const [notifs, setNotifs]   = useState<DbNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('notifications').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setNotifs(data ?? []); setLoading(false) })
  }, [user])

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    const unread = notifs.filter(n => !n.read && n.id !== id).length
    setUnreadCount(unread)
  }

  async function markAllRead() {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const unreadCount = notifs.filter(n => !n.read).length

  const TYPE_ICON: Record<string, string> = {
    message:  '💬',
    favorite: '❤️',
    review:   '⭐',
    system:   '🔔',
    sale:     '💰',
    listing:  '📋',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22}/></button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">اعلان‌ها</h1>
          {unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Check size={14}/> همه خوانده شد
          </button>
        )}
      </div>

      <div className="divide-y divide-[var(--border-color)]">
        {loading
          ? Array.from({length:4}).map((_,i)=><div key={i} className="flex gap-3 px-4 py-4 animate-pulse"><div className="w-10 h-10 rounded-full bg-[var(--surface-color)]"/><div className="flex-1 space-y-2"><div className="h-3 bg-[var(--surface-color)] rounded w-3/4"/><div className="h-3 bg-[var(--surface-color)] rounded w-1/2"/></div></div>)
          : notifs.length === 0
            ? <div className="text-center py-16"><Bell size={48} className="mx-auto text-[var(--border-color)] mb-3"/><p className="text-[var(--text-muted)]">هیچ اعلانی وجود ندارد</p></div>
            : notifs.map(n => (
                <button key={n.id} onClick={() => { markRead(n.id); if (n.link) navigate(n.link) }}
                  className={`w-full flex gap-3 px-4 py-4 text-right active:bg-[var(--surface-color)] transition-colors ${!n.read ? 'bg-[var(--surface-color)]/50' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${!n.read ? 'bg-[var(--text-primary)]/10' : 'bg-[var(--surface-color)]'}`}>
                    {TYPE_ICON[n.type] ?? '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${!n.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{n.title}</p>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">{n.content}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2"/>}
                </button>
              ))
        }
      </div>
    </motion.div>
  )
}
