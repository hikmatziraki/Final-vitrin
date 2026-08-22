import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, Share2, MapPin, Eye, CheckCircle, Star, ChevronRight, ChevronLeft, Flag, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { formatPrice, timeAgo, getCategoryLabel } from '@/utils/constants'
import type { DbListing, DbReview } from '@/lib/supabase'

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, session, favoriteIds, toggleFavoriteLocal } = useAppStore()

  const [listing, setListing]   = useState<DbListing | null>(null)
  const [reviews, setReviews]   = useState<DbReview[]>([])
  const [loading, setLoading]   = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [toast, setToast]       = useState('')
  const [toggling, setToggling] = useState(false)

  const isFav = listing ? favoriteIds.includes(listing.id) : false

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data: l }, { data: r }] = await Promise.all([
        supabase.from('listings').select('*, users(*)').eq('id', id).single(),
        supabase.from('reviews').select('*, reviewer:reviewer_id(*)').eq('listing_id', id).order('created_at', { ascending: false }).limit(10),
      ])
      setListing(l as DbListing | null)
      setReviews(r as DbReview[] ?? [])
      setLoading(false)
      // Increment view
      if (l) supabase.rpc('increment_view', { p_listing_id: l.id })
    }
    load()
  }, [id])

  async function handleFavorite() {
    if (!session) { navigate('/login?next=' + encodeURIComponent(window.location.pathname)); return }
    if (!listing || toggling) return
    setToggling(true)
    const { data: isFavNow } = await supabase.rpc('toggle_favorite', { p_listing_id: listing.id })
    toggleFavoriteLocal(listing.id)
    showToast(isFavNow ? 'به علاقه‌مندی‌ها اضافه شد ❤️' : 'از علاقه‌مندی‌ها حذف شد')
    setToggling(false)
  }

  function handleShare() {
    navigator.share?.({ title: listing?.title, url: window.location.href })
      ?? navigator.clipboard.writeText(window.location.href).then(() => showToast('لینک کپی شد 📋'))
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const images = listing ? (listing.image_urls?.length ? listing.image_urls : listing.image_url ? [listing.image_url] : []) : []
  const seller = (listing as any)?.users

  if (loading) return (
    <div className="animate-pulse">
      <div className="aspect-video bg-[var(--surface-color)]" />
      <div className="p-4 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-4 bg-[var(--surface-color)] rounded" style={{ width: `${90-i*15}%` }} />)}
      </div>
    </div>
  )

  if (!listing) return (
    <div className="text-center py-20 px-4">
      <div className="text-5xl mb-3">😕</div>
      <p className="text-[var(--text-muted)]">اعلان پیدا نشد</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[var(--text-primary)] underline">بازگشت</button>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28">

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--text-primary)] text-[var(--bg-color)] text-sm px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Image carousel */}
      <div className="relative aspect-video bg-[var(--surface-color)]">
        {images.length > 0
          ? <img src={images[imgIndex]} alt={listing.title} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
          : <div className="w-full h-full flex items-center justify-center text-6xl">🖼️</div>
        }
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} disabled={imgIndex === 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))} disabled={imgIndex === images.length - 1}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`} />)}
            </div>
          </>
        )}
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {listing.featured && <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">ویژه</span>}
          {listing.verified_seller && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">تأیید شده ✓</span>}
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-color)] px-2 py-0.5 rounded-full mb-2 inline-block">
              {getCategoryLabel(listing.category)} · {listing.platform}
            </span>
            <h1 className="text-lg font-bold text-[var(--text-primary)] leading-snug">{listing.title}</h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleFavorite} disabled={toggling}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${isFav ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-[var(--border-color)] text-[var(--text-muted)]'}`}>
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleShare}
              className="w-9 h-9 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] flex items-center justify-center">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="card rounded-2xl p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">{formatPrice(listing.price, listing.price_currency)}</span>
            {listing.previous_price && listing.previous_price > listing.price && (
              <span className="text-sm text-[var(--text-muted)] line-through">{formatPrice(listing.previous_price)}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><MapPin size={12} />{listing.city}</span>
            <span className="flex items-center gap-1"><Eye size={12} />{listing.view_count} بازدید</span>
            <span>{timeAgo(listing.created_at)}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">توضیحات</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{listing.description}</p>
        </div>

        {/* Seller */}
        {seller && (
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">فروشنده</h2>
            <Link to={`/seller/${seller.id}`} className="card rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] overflow-hidden shrink-0">
                {seller.avatar_url || seller.photo_url
                  ? <img src={seller.avatar_url ?? seller.photo_url} alt={seller.display_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{seller.display_name}</span>
                  {seller.verified_seller && <CheckCircle size={14} className="text-blue-500" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                  {seller.rating > 0 && <span className="flex items-center gap-0.5"><Star size={11} className="text-amber-400" />{seller.rating.toFixed(1)}</span>}
                  {seller.total_reviews > 0 && <span>{seller.total_reviews} نظر</span>}
                </div>
              </div>
              <ChevronLeft size={16} className="text-[var(--text-muted)]" />
            </Link>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">نظرات ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.slice(0, 3).map(r => (
                <div key={r.id} className="card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--surface-color)] flex items-center justify-center text-sm">
                      {(r.reviewer as any)?.display_name?.[0] ?? '?'}
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{(r.reviewer as any)?.display_name}</span>
                    <div className="flex mr-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < r.rating ? 'text-amber-400' : 'text-[var(--border-color)]'} fill={i < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report */}
        <button onClick={() => {
          if (!session) { navigate('/login'); return }
          const reason = prompt('دلیل گزارش را بنویسید:')
          if (reason && reason.length >= 5) {
            supabase.from('reports').insert({ listing_id: listing.id, reporter_id: user!.id, reason }).then(() => showToast('گزارش ارسال شد ✅'))
          }
        }} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] py-2">
          <Flag size={14} /> گزارش تخلف
        </button>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-[60px] md:bottom-0 right-0 left-0 bg-[var(--bg-color)] border-t border-[var(--border-color)] p-4 z-20 pb-safe">
        <div className="flex gap-3 max-w-2xl mx-auto">
          {session && user?.id !== listing.seller_id && (
            <button
              onClick={async () => {
                if (!session) return
                // Create or find conversation
                const { data: existing } = await supabase.from('conversations').select('id').eq('listing_id', listing.id).eq('buyer_id', user!.id).single()
                if (existing) { navigate(`/chats/${existing.id}`); return }
                const { data: newConv } = await supabase.from('conversations').insert({
                  listing_id: listing.id, buyer_id: user!.id, seller_id: listing.seller_id
                }).select('id').single()
                if (newConv) navigate(`/chats/${newConv.id}`)
              }}
              className="h-13 flex-1 rounded-2xl border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} /> پیام
            </button>
          )}
          <a
            href={`https://wa.me/${listing.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`سلام، درباره «${listing.title}» می‌خواستم بپرسم. ویترین: ${window.location.href}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 h-13 rounded-2xl bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            واتساپ
          </a>
        </div>
      </div>
    </motion.div>
  )
}
