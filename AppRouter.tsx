import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppStore } from '@/store/useAppStore'
import { AnimatePresence } from 'motion/react'

// ── Lazy load ────────────────────────────────────────────────────
const Home          = lazy(() => import('@/pages/Home'))
const Listings      = lazy(() => import('@/pages/Listings'))
const ListingDetail = lazy(() => import('@/pages/ListingDetail'))
const SellerProfile = lazy(() => import('@/pages/SellerProfile'))
const Login         = lazy(() => import('@/pages/Login'))
const Register      = lazy(() => import('@/pages/Register'))
const PostWizard    = lazy(() => import('@/pages/PostWizard'))
const Account       = lazy(() => import('@/pages/Account'))
const MyListings    = lazy(() => import('@/pages/MyListings'))
const Favorites     = lazy(() => import('@/pages/Favorites'))
const Chats         = lazy(() => import('@/pages/Chats'))
const ChatDetail    = lazy(() => import('@/pages/ChatDetail'))
const Settings      = lazy(() => import('@/pages/Settings'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Upgrade       = lazy(() => import('@/pages/Upgrade'))
const Payment       = lazy(() => import('@/pages/Payment'))
const Support       = lazy(() => import('@/pages/Support'))
const Terms         = lazy(() => import('@/pages/Terms'))
const AdminLayout   = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminDash     = lazy(() => import('@/pages/admin/Dashboard'))
const AdminListings = lazy(() => import('@/pages/admin/Listings'))
const AdminUsers    = lazy(() => import('@/pages/admin/Users'))
const AdminReports  = lazy(() => import('@/pages/admin/Reports'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))

// ── Guards ───────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = useAppStore(s => s.session)
  const user    = useAppStore(s => s.user)
  if (!session && !user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const session = useAppStore(s => s.session)
  const user    = useAppStore(s => s.user)
  if (!session && !user) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const session = useAppStore(s => s.session)
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

// ── Loading spinner ──────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-[3px] border-[var(--border-color)] border-t-[var(--text-primary)] rounded-full animate-spin" />
    </div>
  )
}

// ── 404 ─────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-6">
      <span className="text-6xl">🔍</span>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">صفحه پیدا نشد</h1>
      <p className="text-[var(--text-muted)]">آدرسی که دنبالش بودید وجود ندارد.</p>
      <a href="/" className="px-6 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg-color)] text-sm font-semibold">
        بازگشت به خانه
      </a>
    </div>
  )
}

// ── AnimatedRoutes — کلید route برای AnimatePresence ─────────────
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes inside layout */}
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="listings" element={<Listings />} />
          <Route path="listings/:id" element={<ListingDetail />} />
          <Route path="seller/:id" element={<SellerProfile />} />
          <Route path="upgrade" element={<Upgrade />} />
          <Route path="support" element={<Support />} />
          <Route path="terms" element={<Terms />} />

          {/* Auth-only */}
          <Route path="login"    element={<GuestGuard><Login /></GuestGuard>} />
          <Route path="register" element={<GuestGuard><Register /></GuestGuard>} />

          {/* Protected */}
          <Route path="post"          element={<AuthGuard><PostWizard /></AuthGuard>} />
          <Route path="account"       element={<AuthGuard><Account /></AuthGuard>} />
          <Route path="my-listings"   element={<AuthGuard><MyListings /></AuthGuard>} />
          <Route path="favorites"     element={<AuthGuard><Favorites /></AuthGuard>} />
          <Route path="chats"         element={<AuthGuard><Chats /></AuthGuard>} />
          <Route path="chats/:id"     element={<AuthGuard><ChatDetail /></AuthGuard>} />
          <Route path="settings"      element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
          <Route path="payment"       element={<AuthGuard><Payment /></AuthGuard>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin — بدون AppLayout */}
        <Route path="admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index           element={<AdminDash />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="users"    element={<AdminUsers />} />
          <Route path="reports"  element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}
