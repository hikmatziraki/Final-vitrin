import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

// Pages where TopNav is hidden (they have their own header)
const NO_TOP_NAV = ['/login', '/register', '/post']
// Pages where BottomNav is hidden
const NO_BOTTOM_NAV = ['/login', '/register', '/post']

export function AppLayout() {
  const { pathname } = useLocation()

  const hideTop    = NO_TOP_NAV.some(p => pathname.startsWith(p))
  const hideBottom = NO_BOTTOM_NAV.some(p => pathname.startsWith(p))
    || pathname.startsWith('/chats/')  // chat detail has its own bottom

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--bg-color)]">
      {!hideTop && <TopNav />}

      <main className={`flex-1 ${!hideTop ? 'mt-14' : ''} ${!hideBottom ? 'mb-[60px]' : ''}`}>
        <Outlet />
      </main>

      {!hideBottom && <BottomNav />}
    </div>
  )
}
