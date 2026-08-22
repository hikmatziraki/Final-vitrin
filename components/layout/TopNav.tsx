import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, MapPin, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { CITIES } from '@/utils/constants'
import { motion, AnimatePresence } from 'motion/react'

export function TopNav() {
  const { user, city, setCity, unreadCount } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [showCityPicker, setShowCityPicker] = useState(false)

  const isHome = location.pathname === '/'

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-30 bg-[var(--bg-color)] border-b border-[var(--border-color)] h-14">
        <div className="flex items-center justify-between h-full px-4 max-w-2xl mx-auto">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-xl font-black text-[var(--text-primary)]">ویترین</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">🇦🇫</span>
          </Link>

          {/* Center: City selector (only on home) */}
          {isHome && (
            <button
              onClick={() => setShowCityPicker(true)}
              className="flex items-center gap-1 text-sm text-[var(--text-secondary)] bg-[var(--surface-color)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]"
            >
              <MapPin size={13} className="text-[var(--text-muted)]" />
              <span className="max-w-[80px] truncate">{city || 'همه شهرها'}</span>
              <ChevronDown size={13} className="text-[var(--text-muted)]" />
            </button>
          )}

          {/* Right: Notification + Avatar */}
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative w-9 h-9 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center"
              >
                <Bell size={18} className="text-[var(--text-primary)]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <Link to="/account">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-bold text-[var(--text-muted)]">{user.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-[var(--text-primary)] bg-[var(--surface-color)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl"
              >
                ورود
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* City picker sheet */}
      <AnimatePresence>
        {showCityPicker && (
          <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowCityPicker(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full bg-[var(--bg-color)] rounded-t-3xl max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[var(--bg-color)] px-5 pt-5 pb-3 border-b border-[var(--border-color)]">
                <div className="w-10 h-1 rounded-full bg-[var(--border-color)] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">انتخاب شهر</h3>
              </div>
              <div className="p-3">
                <button
                  onClick={() => { setCity(''); setShowCityPicker(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1 text-right transition-colors ${!city ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'hover:bg-[var(--surface-color)]'}`}
                >
                  <span className="text-sm font-semibold">همه شهرها</span>
                </button>
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCity(c); setShowCityPicker(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1 text-right transition-colors ${city === c ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'hover:bg-[var(--surface-color)]'}`}
                  >
                    <MapPin size={16} className="shrink-0" />
                    <span className="text-sm font-medium">{c}</span>
                  </button>
                ))}
              </div>
              <div className="h-safe pb-4" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
