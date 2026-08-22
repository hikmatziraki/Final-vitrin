import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Star, CheckCircle, MapPin, ChevronRight, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatPrice, timeAgo, toPersianDigits } from '@/utils/constants'
import type { DbUser, DbListing, DbReview } from '@/lib/supabase'

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [seller, setSeller]     = useState<DbUser | null>(null)
  const [listings, setListings] = useState<DbListing[]>([])
  const [reviews, setReviews]   = useState<DbReview[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('users').select('*').eq('id', id).single(),
      supabase.from('listings').select('*').eq('seller_id', id).eq('status', 'published').order('created_at', { ascending: false }).limit(10),
      supabase.from('reviews').select('*, reviewer:reviewer_id(*)').eq('reviewee_id', id).order('created_at', { ascending: false }).limit(20),
    ]).then(([{data:s},{data:l},{data:r}]) => {
      setSeller(s as DbUser)
      setListings(l ?? [])
      setReviews(r as DbReview[] ?? [])
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="animate-pulse px-4 pt-4 space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-[var(--surface-color)] rounded-2xl"/>)}</div>
  if (!seller)  return <div className="text-center py-16 text-[var(--text-muted)]">فروشنده پیدا نشد</div>

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22}/></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">پروفایل فروشنده</h1>
      </div>

      {/* Profile card */}
      <div className="px-4 pt-4 pb-5">
        <div className="card rounded-3xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-color)] overflow-hidden shrink-0">
              {seller.avatar_url || seller.photo_url
                ? <img src={seller.avatar_url ?? seller.photo_url!} alt={seller.display_name} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--text-muted)]">{seller.display_name[0]}</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-[var(--text-primary)]">{seller.display_name}</h2>
                {seller.verified_seller && <CheckCircle size={15} className="text-blue-500"/>}
              </div>
              {seller.city && <p className="text-xs text-[var(--text-muted)] flex items-center gap-0.5 mt-0.5"><MapPin size={10}/>{seller.city}</p>}
              {seller.bio && <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{seller.bio}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'اعلانات', value: toPersianDigits(listings.length) },
              { label: 'امتیاز', value: avgRating > 0 ? toPersianDigits(avgRating.toFixed(1)) : '-' },
              { label: 'نظرات', value: toPersianDigits(reviews.length) },
            ].map(s => (
              <div key={s.label} className="bg-[var(--surface-color)] rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-[var(--text-primary)]">{s.value}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      {listings.length > 0 && (
        <section className="px-4 mb-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Package size={16}/>اعلانات فعال</h3>
          <div className="grid grid-cols-2 gap-3">
            {listings.map(item => {
              const img = item.image_urls?.[0] ?? item.image_url
              return (
                <button key={item.id} onClick={() => navigate(`/listings/${item.id}`)} className="card rounded-2xl overflow-hidden text-right">
                  <div className="aspect-video bg-[var(--surface-color)]">
                    {img ? <img src={img} alt={item.title} className="w-full h-full object-cover" onError={e=>(e.currentTarget.style.display='none')}/> : <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 mb-1">{item.title}</p>
                    <p className="text-xs font-bold text-emerald-500">{formatPrice(item.price, item.price_currency)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="px-4 mb-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Star size={16} className="text-amber-400"/>نظرات ({reviews.length})</h3>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--surface-color)] flex items-center justify-center text-sm font-bold">{(r.reviewer as any)?.display_name?.[0]}</div>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{(r.reviewer as any)?.display_name}</span>
                  <div className="flex mr-auto">{Array.from({length:5}).map((_,i)=><Star key={i} size={11} className={i<r.rating?'text-amber-400':'text-[var(--border-color)]'} fill={i<r.rating?'currentColor':'none'}/>)}</div>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{r.comment}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{timeAgo(r.created_at)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  )
}
