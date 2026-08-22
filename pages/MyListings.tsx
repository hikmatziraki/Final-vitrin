import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus, Eye, Trash2, PauseCircle, PlayCircle, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { formatPrice, timeAgo } from '@/utils/constants'
import type { DbListing } from '@/lib/supabase'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  published:      { label: 'فعال',          color: 'text-emerald-500 bg-emerald-500/10' },
  paused:         { label: 'متوقف',         color: 'text-amber-500 bg-amber-500/10' },
  pending_review: { label: 'در بررسی',      color: 'text-blue-500 bg-blue-500/10' },
  rejected:       { label: 'رد شده',        color: 'text-red-500 bg-red-500/10' },
  sold:           { label: 'فروخته شده',    color: 'text-purple-500 bg-purple-500/10' },
  draft:          { label: 'پیش‌نویس',      color: 'text-[var(--text-muted)] bg-[var(--surface-color)]' },
}

export default function MyListings() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [listings, setListings] = useState<DbListing[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    if (!user) return
    supabase.from('listings').select('*').eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setListings(data ?? []); setLoading(false) })
  }, [user])

  async function toggleStatus(listing: DbListing) {
    const newStatus = listing.status === 'published' ? 'paused' : 'published'
    const { error } = await supabase.from('listings').update({ status: newStatus, active: newStatus === 'published' }).eq('id', listing.id)
    if (!error) setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l))
  }

  async function deleteListing(id: string) {
    if (!confirm('اعلان حذف شود؟')) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (!error) setListings(prev => prev.filter(l => l.id !== id))
  }

  const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter)
  const tabs = [
    { id: 'all',       label: 'همه', count: listings.length },
    { id: 'published', label: 'فعال', count: listings.filter(l => l.status === 'published').length },
    { id: 'paused',    label: 'متوقف', count: listings.filter(l => l.status === 'paused').length },
    { id: 'sold',      label: 'فروخته شده', count: listings.filter(l => l.status === 'sold').length },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22} /></button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">اعلانات من</h1>
        </div>
        <button onClick={() => navigate('/post')}
          className="flex items-center gap-1 bg-[var(--text-primary)] text-[var(--bg-color)] text-sm font-semibold px-3 py-1.5 rounded-xl">
          <Plus size={16} /> ثبت اعلان
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${filter === t.id ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'bg-[var(--surface-color)] text-[var(--text-secondary)]'}`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === t.id ? 'bg-white/20' : 'bg-[var(--border-color)]'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 space-y-3 pb-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card rounded-2xl h-24 animate-pulse" />
            ))
          : filtered.length === 0
            ? <div className="text-center py-16">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-[var(--text-muted)] text-sm">اعلانی وجود ندارد</p>
                <button onClick={() => navigate('/post')}
                  className="mt-4 h-11 px-6 rounded-xl bg-[var(--text-primary)] text-[var(--bg-color)] text-sm font-semibold">
                  ثبت اعلان جدید
                </button>
              </div>
            : filtered.map(listing => {
                const img  = listing.image_urls?.[0] ?? listing.image_url
                const meta = STATUS_LABEL[listing.status] ?? STATUS_LABEL.draft
                return (
                  <div key={listing.id} className="card rounded-2xl overflow-hidden">
                    <div className="flex gap-3 p-3">
                      <Link to={`/listings/${listing.id}`} className="shrink-0">
                        <div className="w-16 h-16 rounded-xl bg-[var(--surface-color)] overflow-hidden">
                          {img ? <img src={img} alt={listing.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/listings/${listing.id}`}>
                          <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{listing.title}</p>
                        </Link>
                        <p className="text-xs text-emerald-500 font-bold mt-0.5">{formatPrice(listing.price, listing.price_currency)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
                            <Eye size={10} />{listing.view_count}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(listing.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    {!['sold','rejected','expired'].includes(listing.status) && (
                      <div className="flex border-t border-[var(--border-color)] divide-x divide-[var(--border-color)]">
                        <button onClick={() => toggleStatus(listing)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-[var(--text-secondary)]">
                          {listing.status === 'published' ? <><PauseCircle size={15} /> توقف</> : <><PlayCircle size={15} /> فعال کردن</>}
                        </button>
                        <button onClick={() => deleteListing(listing.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-red-500">
                          <Trash2 size={15} /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
        }
      </div>
    </motion.div>
  )
}
