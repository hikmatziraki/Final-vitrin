import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Check, X, Trash2, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice, timeAgo } from '@/utils/constants'
import type { DbListing } from '@/lib/supabase'

export default function AdminListings() {
  const [listings, setListings] = useState<DbListing[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'pending_review' | 'published' | 'rejected'>('pending_review')

  async function load(status: string) {
    setLoading(true)
    const { data } = await supabase.from('listings').select('*, users(display_name,avatar_url)')
      .eq('status', status).order('created_at', { ascending: false }).limit(50)
    setListings(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  async function approve(id: string) {
    await supabase.from('listings').update({ status: 'published', active: true }).eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function reject(id: string) {
    await supabase.from('listings').update({ status: 'rejected', active: false }).eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  async function remove(id: string) {
    if (!confirm('حذف شود؟')) return
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
      <h1 className="text-xl font-black text-[var(--text-primary)]">مدیریت اعلانات</h1>

      <div className="flex gap-2">
        {([['pending_review','در انتظار'],['published','منتشر شده'],['rejected','رد شده']] as const).map(([s, l]) => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${tab === s ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'bg-[var(--surface-color)] text-[var(--text-secondary)]'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading
        ? <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="card rounded-2xl h-20 animate-pulse"/>)}</div>
        : listings.length === 0
          ? <div className="text-center py-10 text-[var(--text-muted)]">اعلانی وجود ندارد</div>
          : <div className="space-y-3">
              {listings.map(l => {
                const img = l.image_urls?.[0] ?? l.image_url
                return (
                  <div key={l.id} className="card rounded-2xl overflow-hidden">
                    <div className="flex gap-3 p-3">
                      <a href={`/listings/${l.id}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-[var(--surface-color)] overflow-hidden">
                          {img ? <img src={img} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center text-xl">🖼️</div>}
                        </div>
                      </a>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{l.title}</p>
                        <p className="text-xs text-emerald-500">{formatPrice(l.price, l.price_currency)}</p>
                        <div className="flex gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                          <span>{(l as any).users?.display_name}</span>
                          <span>·</span><span>{timeAgo(l.created_at)}</span>
                          <span>·</span><span className="flex items-center gap-0.5"><Eye size={10}/>{l.view_count}</span>
                        </div>
                      </div>
                    </div>
                    {tab === 'pending_review' && (
                      <div className="flex border-t border-[var(--border-color)] divide-x divide-[var(--border-color)]">
                        <button onClick={() => approve(l.id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-emerald-500"><Check size={14}/>تأیید</button>
                        <button onClick={() => reject(l.id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-red-500"><X size={14}/>رد</button>
                        <button onClick={() => remove(l.id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-[var(--text-muted)]"><Trash2 size={14}/>حذف</button>
                      </div>
                    )}
                    {tab === 'published' && (
                      <div className="flex border-t border-[var(--border-color)]">
                        <button onClick={() => remove(l.id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-red-500"><Trash2 size={14}/>حذف</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
      }
    </motion.div>
  )
}
