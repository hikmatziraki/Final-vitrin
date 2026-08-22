import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, ChevronRight, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { formatPrice, timeAgo } from '@/utils/constants'
import type { DbListing } from '@/lib/supabase'

export default function Favorites() {
  const navigate = useNavigate()
  const { user, favoriteIds, toggleFavoriteLocal } = useAppStore()
  const [listings, setListings] = useState<DbListing[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user || favoriteIds.length === 0) { setLoading(false); return }
    supabase.from('listings').select('*, users(*)').in('id', favoriteIds).eq('status', 'published')
      .then(({ data }) => { setListings(data ?? []); setLoading(false) })
  }, [user, favoriteIds])

  async function removeFav(listingId: string) {
    await supabase.rpc('toggle_favorite', { p_listing_id: listingId })
    toggleFavoriteLocal(listingId)
    setListings(prev => prev.filter(l => l.id !== listingId))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22} /></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">علاقه‌مندی‌ها</h1>
      </div>

      <div className="px-4 pt-3 pb-4">
        {loading
          ? <div className="grid grid-cols-2 gap-3">{Array.from({length:4}).map((_,i)=><div key={i} className="card rounded-2xl h-48 animate-pulse"/>)}</div>
          : listings.length === 0
            ? <div className="text-center py-16"><Heart size={48} className="mx-auto text-[var(--border-color)] mb-3"/><p className="text-[var(--text-muted)]">هنوز اعلانی ذخیره نکرده‌اید.</p></div>
            : <div className="grid grid-cols-2 gap-3">
                {listings.map(item => {
                  const img = item.image_urls?.[0] ?? item.image_url
                  return (
                    <div key={item.id} className="card rounded-2xl overflow-hidden relative">
                      <button onClick={() => navigate(`/listings/${item.id}`)} className="w-full text-right">
                        <div className="aspect-video bg-[var(--surface-color)]">
                          {img ? <img src={img} alt={item.title} className="w-full h-full object-cover" onError={e=>(e.currentTarget.style.display='none')}/> : <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 mb-1">{item.title}</p>
                          <p className="text-xs font-bold text-emerald-500">{formatPrice(item.price, item.price_currency)}</p>
                          <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5 mt-1"><MapPin size={9}/>{item.city}</p>
                        </div>
                      </button>
                      <button onClick={()=>removeFav(item.id)} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Heart size={14} className="text-red-500" fill="currentColor"/>
                      </button>
                    </div>
                  )
                })}
              </div>
        }
      </div>
    </motion.div>
  )
}
