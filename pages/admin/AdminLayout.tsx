import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Users, Flag, Settings, LogOut, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

const menuItems = [
  { name: 'داشبورد',     path: '/admin',          icon: LayoutDashboard },
  { name: 'اعلانات',     path: '/admin/listings', icon: Package },
  { name: 'کاربران',     path: '/admin/users',    icon: Users },
  { name: 'گزارش‌ها',   path: '/admin/reports',  icon: Flag },       // Flag icon - different from Package
  { name: 'تنظیمات',    path: '/admin/settings', icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAppStore()

  async function handleLogout() {
    await supabase.auth.signOut()
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[var(--bg-color)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[var(--text-muted)]"><ChevronRight size={22}/></Link>
          <span className="font-display font-black text-lg text-[var(--text-primary)]">ویترین</span>
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">Admin</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <LogOut size={16}/> خروج
        </button>
      </div>

      {/* Horizontal nav on mobile, sidebar on desktop */}
      <div className="flex flex-col md:flex-row">
        {/* Nav */}
        <nav className="md:w-52 md:min-h-[calc(100vh-56px)] md:border-l md:border-[var(--border-color)] md:sticky md:top-14 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto px-3 py-2 md:p-3 md:overflow-x-visible scrollbar-hide">
            {menuItems.map(item => {
              const active = item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path)
              return (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    active ? 'bg-[var(--text-primary)] text-[var(--bg-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-color)]'
                  }`}>
                  <item.icon size={17} />
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden text-xs">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
