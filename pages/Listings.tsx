import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search, SlidersHorizontal, X, MapPin, Star, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { CATEGORIES, CITIES, formatPrice, timeAgo } from '@/utils/constants'
import type { DbListing } from '@/lib/supabase'

function ListingSkeleton() {
  return (
    <div className="card rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-[var(--surface-color)]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[var(--surface-color)] rounded w-3/4" />
        <div className="h-3 bg-[var(--surface-color)] rounded w-1/2" />
        <div className="h-3 bg-[var(--surface-color)] rounded w-1/3" />
      </div>
    </div>
  )
}

export default function Listings() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { favoriteIds } = useAppStore()

  const query    = params.get('q') ?? ''
  const cat      = params.get('cat') ?? ''
  const cityP    = params.get('city') ?? ''
  const featured = params.get('featured') === '1'
  const sortP    = params.get('sort') ?? 'newest'

  const [searchInput, setSearchInput] = useState(query)
  const [listings, setListings]       = useState<DbListing[]>([])
  const [loading, setLoading]         = useState(true)
  const [total, setTotal]             = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Filters state
  const [cityFilter, setCityFilter]   = useState(cityP)
  const [catFilter, setCatFilter]     = useState(cat)
  const [sort, setSort]               = useState(sortP)
  const [minPrice, setMinPrice]       = useState(params.get('min') ?? '')
  const [maxPrice, setMaxPrice]       = useState(params.get('max') ?? '')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('listings').select('*, users(*)', { count: 'exact' }).eq('status', 'published')

    if (query)       q = q.ilike('title', `%${query}%`)
    if (catFilter)   q = q.eq('category', catFilter)
    if (cityFilter)  q = q.ilike('city', cityFilter)
    if (featured)    q = q.eq('featured', true)
    if (minPrice)    q = q.gte('price', Number(minPrice))
    if (maxPrice)    q = q.lte('price', Number(maxPrice))

    if (sort === 'newest')    q = q.order('created_at', { ascending: false })
    else if (sort === 'price_asc')  q = q.order('price', { ascending: true })
    else if (sort === 'price_desc') q = q.order('price', { ascending: false })
    else if (sort === 'views')      q = q.order('view_count', { ascending: false })

    q = q.order('featured', { ascending: false }).limit(50)

    const { data, count } = await q
    setListings(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [query, catFilter, cityFilter, featured, sort, minPrice, maxPrice])

  useEffect(() => { fetchListings() }, [fetchListings])

  function applyFilters() {
    const p = new URLSearchParams()
    if (query)      p.set('q', query)
    if (catFilter)  p.set('cat', catFilter)
    if (cityFilter) p.set('city', cityFilter)
    if (sort !== 'newest') p.set('sort', sort)
    if (minPrice)   p.set('min', minPrice)
    if (maxPrice)   p.set('max', maxPrice)
    setParams(p)
    setShowFilters(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const p = new URLSearchParams(params)
    if (searchInput.trim()) p.set('q', searchInput.trim())
    else p.delete('q')
    setParams(p)
  }

  const activeFilters = [catFilter, cityFilter, minPrice, maxPrice].filter(Boolean).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-[var(--bg-color)] px-4 pt-3 pb-2 border-b border-[var(--border-color)]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="جستجوی اعلانات..."
              className="w-full h-10 pr-9 pl-3 rounded-xl bg-[var(--surface-color)] text-[var(--text-primary)] text-sm border border-[var(--border-color)] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="relative h-10 w-10 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center"
          >
            <SlidersHorizontal size={18} className="text-[var(--text-primary)]" />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{activeFilters}</span>
            )}
          </button>
        </form>

        {/* Active category chips */}
        {(catFilter || cityFilter) && (
          <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
            {catFilter && (
              <button onClick={() => { setCatFilter(''); const p = new URLSearchParams(params); p.delete('cat'); setParams(p) }}
                className="flex items-center gap-1 text-xs bg-[var(--text-primary)] text-[var(--bg-color)] px-3 py-1 rounded-full">
                {CATEGORIES.find(c => c.id === catFilter)?.label} <X size={12} />
              </button>
            )}
            {cityFilter && (
              <button onClick={() => { setCityFilter(''); const p = new URLSearchParams(params); p.delete('city'); setParams(p) }}
                className="flex items-center gap-1 text-xs bg-[var(--text-primary)] text-[var(--bg-color)] px-3 py-1 rounded-full">
                <MapPin size={10} /> {cityFilter} <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 text-xs text-[var(--text-muted)]">
        {!loading && <span>{total} اعلان پیدا شد</span>}
      </div>

      {/* Grid */}
      <div className="px-4 pb-4">
        {loading
          ? <div className="grid grid-cols-2 gap-3">{Array.from({ length: 8 }).map((_, i) => <ListingSkeleton key={i} />)}</div>
          : listings.length === 0
            ? <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-[var(--text-muted)]">اعلانی پیدا نشد</p>
                <button onClick={() => { setParams(new URLSearchParams()); setCatFilter(''); setCityFilter('') }}
                  className="mt-3 text-sm text-[var(--text-primary)] underline">حذف فیلترها</button>
              </div>
            : <div className="grid grid-cols-2 gap-3">
                {listings.map(item => <ListingCard key={item.id} item={item} isFav={favoriteIds.includes(item.id)} onClick={() => navigate(`/listings/${item.id}`)} />)}
              </div>
        }
      </div>

      {/* Filter Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowFilters(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <motion.div
            initial={{ y: 300 }} animate={{ y: 0 }}
            className="relative w-full bg-[var(--bg-color)] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">فیلترها</h3>
              <button onClick={() => setShowFilters(false)} className="text-[var(--text-muted)]"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="label mb-2">دسته‌بندی</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: '', label: 'همه' }, ...CATEGORIES].map(c => (
                    <button key={c.id} onClick={() => setCatFilter(c.id)}
                      className={`py-2 rounded-xl text-sm border transition-colors ${catFilter === c.id ? 'bg-[var(--text-primary)] text-[var(--bg-color)] border-[var(--text-primary)]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label mb-2">شهر</label>
                <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input-base w-full">
                  <option value="">همه شهرها</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="label mb-2">محدوده قیمت (افغانی)</label>
                <div className="flex gap-2">
                  <input value={minPrice} onChange={e => setMinPrice(e.target.value)} className="input-base flex-1" placeholder="از" type="number" min="0" />
                  <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input-base flex-1" placeholder="تا" type="number" min="0" />
                </div>
              </div>

              <div>
                <label className="label mb-2">مرتب‌سازی</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="input-base w-full">
                  <option value="newest">جدیدترین</option>
                  <option value="price_asc">ارزان‌ترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="views">پربازدیدترین</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setCatFilter(''); setCityFilter(''); setMinPrice(''); setMaxPrice(''); setSort('newest') }}
                  className="flex-1 h-12 rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-semibold">
                  پاک کردن
                </button>
                <button onClick={applyFilters}
                  className="flex-1 h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] text-sm font-semibold">
                  اعمال فیلتر
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

function ListingCard({ item, isFav, onClick }: { item: DbListing; isFav: boolean; onClick: () => void }) {
  const img = item.image_urls?.[0] ?? item.image_url
  return (
    <button onClick={onClick} className="card rounded-2xl overflow-hidden text-right active:scale-95 transition-transform w-full">
      <div className="aspect-video bg-[var(--surface-color)] relative">
        {img
          ? <img src={img} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={e => (e.currentTarget.style.display = 'none')} />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
        }
        {item.featured && <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">ویژه</span>}
        {isFav && <span className="absolute top-2 left-2 text-red-500 text-sm">❤️</span>}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 flex-1">{item.title}</p>
          {item.verified_seller && <CheckCircle size={12} className="text-blue-500 shrink-0 mt-0.5" />}
        </div>
        <p className="text-xs font-bold text-emerald-500">{formatPrice(item.price, item.price_currency)}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
            <MapPin size={9} />{item.city}
          </span>
          {(item.users as any)?.rating > 0 && (
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
              <Star size={9} className="text-amber-400" />{(item.users as any).rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
