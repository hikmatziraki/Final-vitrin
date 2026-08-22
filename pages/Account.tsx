import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Settings, Star, ChevronLeft, CheckCircle, Package, Heart, MessageCircle, LogOut, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toPersianDigits } from '@/utils/constants'
import type { DbListing } from '@/lib/supabase'

export default function Account() {
  const navigate = useNavigate()
  const { user, dbUser, logout } = useAppStore()
  const [myListings, setMyListings] = useState<DbListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('listings').select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { setMyListings(data ?? []); setLoading(false) })
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    logout()
    navigate('/')
  }

  if (!user) return null

  const avatar = dbUser?.avatar_url ?? dbUser?.photo_url

  const stats = [
    { label: 'اعلانات', value: toPersianDigits(dbUser?.active_listings_count ?? 0), icon: Package },
    { label: 'امتیاز',  value: dbUser?.rating ? toPersianDigits(dbUser.rating.toFixed(1)) : '-', icon: Star },
    { label: 'فروخته شده', value: toPersianDigits(dbUser?.sold_count ?? 0), icon: CheckCircle },
  ]

  const menuItems = [
    { icon: Package,      label: 'اعلانات من',    path: '/my-listings' },
    { icon: Heart,        label: 'علاقه‌مندی‌ها', path: '/favorites' },
    { icon: MessageCircle,label: 'پیام‌ها',        path: '/chats' },
    { icon: Settings,     label: 'تنظیمات',        path: '/settings' },
    ...(user.role === 'admin' ? [{ icon: ShieldCheck, label: 'پنل مدیریت', path: '/admin' }] : []),
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      {/* Profile header */}
      <div className="px-4 pt-4 pb-6">
        <div className="card rounded-3xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-color)] overflow-hidden shrink-0">
              {avatar
                ? <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--text-muted)]">{user.name[0]}</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-bold text-[var(--text-primary)] text-base truncate">{user.name}</h1>
                {user.verifiedSeller && <CheckCircle size={15} className="text-blue-500 shrink-0" />}
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
              {user.city && <p className="text-xs text-[var(--text-muted)] mt-0.5">📍 {user.city}</p>}
            </div>
            <Link to="/settings" className="w-9 h-9 rounded-xl border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
              <Settings size={18} />
            </Link>
          </div>

          {/* Verification badge */}
          {user.verification === 'verified' && (
            <div className="flex items-center gap-2 bg-blue-500/10 rounded-xl px-3 py-2 mb-3">
              <ShieldCheck size={16} className="text-blue-500" />
              <span className="text-xs text-blue-500 font-semibold">فروشنده تأیید شده ✓</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map(s => (
              <div key={s.label} className="bg-[var(--surface-color)] rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-[var(--text-primary)]">{s.value}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent listings */}
      {!loading && myListings.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">اعلانات اخیر</h2>
            <Link to="/my-listings" className="text-xs text-[var(--text-muted)] flex items-center gap-0.5">همه <ChevronLeft size={14} /></Link>
          </div>
          <div className="space-y-2">
            {myListings.map(l => (
              <Link key={l.id} to={`/listings/${l.id}`}
                className="card rounded-2xl p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-color)] overflow-hidden shrink-0">
                  {l.image_urls?.[0] ?? l.image_url
                    ? <img src={l.image_urls?.[0] ?? l.image_url!} className="w-full h-full object-cover" alt={l.title} />
                    : <div className="w-full h-full flex items-center justify-center text-xl">🖼️</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{l.title}</p>
                  <p className="text-xs text-emerald-500 font-bold">{l.price > 0 ? `${l.price.toLocaleString()} AFN` : 'توافقی'}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${l.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-400/10 text-amber-500'}`}>
                  {l.status === 'published' ? 'فعال' : l.status === 'paused' ? 'متوقف' : l.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="px-4 mb-5">
        <div className="card rounded-3xl overflow-hidden divide-y divide-[var(--border-color)]">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path}
              className="flex items-center gap-3 px-5 py-4 active:bg-[var(--surface-color)] transition-colors">
              <item.icon size={18} className="text-[var(--text-muted)] shrink-0" />
              <span className="flex-1 text-sm text-[var(--text-primary)]">{item.label}</span>
              <ChevronLeft size={16} className="text-[var(--text-muted)]" />
            </Link>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mb-8">
        <button onClick={handleLogout}
          className="w-full h-13 rounded-2xl border border-red-500/30 text-red-500 font-semibold text-sm flex items-center justify-center gap-2">
          <LogOut size={18} /> خروج از حساب
        </button>
      </div>
    </motion.div>
  )
}
