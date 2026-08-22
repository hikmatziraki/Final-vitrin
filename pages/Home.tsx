import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search, MapPin, ChevronLeft, Gamepad, Radio, Key, CreditCard, PenTool, Monitor, Megaphone, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { CATEGORIES, formatPrice, timeAgo } from '@/utils/constants'
import type { DbListing } from '@/lib/supabase'

const ICON_MAP: Record<string, React.ElementType> = {
  Gamepad, Radio, Key, CreditCard, PenTool, Monitor, Megaphone, MoreHorizontal,
}

function CategoryIcon({ iconName }: { iconName: string }) {
  const Icon = ICON_MAP[iconName] ?? MoreHorizontal
  return <Icon size={20} />
}

function ListingSkeleton() {
  return (
    <div className="card rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-[var(--surface-color)]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[var(--surface-color)] rounded w-3/4" />
        <div className="h-3 bg-[var(--surface-color)] rounded w-1/2" />
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { city, setCity, setSearchQuery } = useAppStore()

  const [searchInput, setSearchInput] = useState('')
  const [featured, setFeatured]       = useState<DbListing[]>([])
  const [latest, setLatest]           = useState<DbListing[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: f }, { data: l }] = await Promise.all([
        supabase.from('listings').select('*, users(*)').eq('status', 'published').eq('featured', true)
          .order('created_at', { ascending: false }).limit(6),
        supabase.from('listings').select('*, users(*)').eq('status', 'published')
          .order('created_at', { ascending: false }).limit(12),
      ])
      setFeatured(f ?? [])
      setLatest(l ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchInput.trim()) return
    setSearchQuery(searchInput.trim())
    navigate(`/listings?q=${encodeURIComponent(searchInput.trim())}`)
  }

  function goCategory(cat: string) {
    navigate(`/listings?cat=${cat}`)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">

      {/* Hero */}
      <div className="px-4 pt-4 pb-6">
        <div className="relative rounded-3xl bg-[var(--text-primary)] text-[var(--bg-color)] p-5 overflow-hidden">
          <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
          <h1 className="font-display text-2xl font-black mb-1">ویترین 🇦🇫</h1>
          <p className="text-sm opacity-70 mb-4">خرید و فروش دیجیتال در افغانستان</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="دنبال چه می‌گردید؟"
                className="w-full h-10 pr-9 pl-3 rounded-xl bg-white/10 text-[var(--bg-color)] placeholder:opacity-50 text-sm border border-white/20 focus:outline-none focus:border-white/50"
              />
            </div>
            <button type="submit" className="h-10 px-4 rounded-xl bg-[var(--bg-color)] text-[var(--text-primary)] text-sm font-semibold">
              جستجو
            </button>
          </form>

          {/* City selector */}
          <div className="flex items-center gap-1.5 mt-3">
            <MapPin size={13} className="opacity-60" />
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="bg-transparent text-xs opacity-80 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="" className="text-black">همه شهرها</option>
              {['کابل','هرات','مزارشریف','قندهار','جلال‌آباد'].map(c => (
                <option key={c} value={c} className="text-black">{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="px-4 mb-6">
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">دسته‌بندی‌ها</h2>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => goCategory(cat.id)}
              className="card rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-color)] flex items-center justify-center text-[var(--text-primary)]">
                <CategoryIcon iconName={cat.icon} />
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {(loading || featured.length > 0) && (
        <section className="mb-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--text-primary)]">اعلانات ویژه ✨</h2>
            <button onClick={() => navigate('/listings?featured=1')} className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              همه <ChevronLeft size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide snap-x snap-mandatory">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-52 card rounded-2xl overflow-hidden animate-pulse snap-start">
                    <div className="h-32 bg-[var(--surface-color)]" />
                    <div className="p-3 space-y-2"><div className="h-3 bg-[var(--surface-color)] rounded w-3/4" /></div>
                  </div>
                ))
              : featured.map(item => (
                  <ListingCard key={item.id} item={item} featured onClick={() => navigate(`/listings/${item.id}`)} />
                ))
            }
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[var(--text-primary)]">جدیدترین اعلانات</h2>
          <button onClick={() => navigate('/listings')} className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            همه <ChevronLeft size={14} />
          </button>
        </div>
        {loading
          ? <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <ListingSkeleton key={i} />)}
            </div>
          : latest.length === 0
            ? <p className="text-center text-[var(--text-muted)] py-8">هنوز اعلانی ثبت نشده است.</p>
            : <div className="grid grid-cols-2 gap-3">
                {latest.map(item => (
                  <ListingCard key={item.id} item={item} onClick={() => navigate(`/listings/${item.id}`)} />
                ))}
              </div>
        }
      </section>
    </motion.div>
  )
}

// ─── Mini listing card ────────────────────────────────────────
function ListingCard({ item, featured, onClick }: { item: DbListing; featured?: boolean; onClick: () => void }) {
  const img = item.image_urls?.[0] ?? item.image_url
  return (
    <button
      onClick={onClick}
      className={`card rounded-2xl overflow-hidden text-right active:scale-95 transition-transform w-full ${featured ? 'shrink-0 w-52 snap-start' : ''}`}
    >
      <div className="aspect-video bg-[var(--surface-color)] relative">
        {img
          ? <img src={img} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={e => (e.currentTarget.style.display = 'none')} />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
        }
        {item.featured && (
          <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">ویژه</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 mb-1">{item.title}</p>
        <p className="text-xs font-bold text-emerald-500">{formatPrice(item.price, item.price_currency)}</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">{timeAgo(item.created_at)}</p>
      </div>
    </button>
  )
}
