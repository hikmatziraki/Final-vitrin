import { Link, useLocation } from 'react-router-dom'
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const NAV_ITEMS = [
  { path: '/',         icon: Home,          label: 'خانه',    auth: false },
  { path: '/listings', icon: Search,        label: 'جستجو',   auth: false },
  { path: '/post',     icon: PlusCircle,    label: 'ثبت',     auth: false, highlight: true },
  { path: '/chats',    icon: MessageCircle, label: 'پیام‌ها', auth: true  },
  { path: '/account',  icon: User,          label: 'حساب',    auth: true  },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { user }     = useAppStore()

  return (
    <nav className="fixed bottom-0 right-0 left-0 z-30 bg-[var(--bg-color)] border-t border-[var(--border-color)]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-[60px] max-w-2xl mx-auto px-2">
        {NAV_ITEMS.map(item => {
          const isActive = item.path === '/'
            ? pathname === '/'
            : pathname.startsWith(item.path)

          const href = (!user && item.auth)
            ? `/login?next=${item.path}`
            : item.path

          if (item.highlight) {
            return (
              <Link key={item.path} to={href} className="flex flex-col items-center gap-0.5 -mt-5">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[var(--text-primary)] flex items-center justify-center shadow-lg shadow-black/20">
                  <item.icon size={24} className="text-[var(--bg-color)]" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link key={item.path} to={href} className="flex flex-col items-center gap-0.5 w-14 py-1">
              <item.icon
                size={22}
                className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[9px] font-medium ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
