import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import type { DbUser } from '@/lib/supabase'

// Session را با any type کنیم تا circular import نداشته باشیم
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySession = any

interface AppState {
  // Auth
  session: AnySession | null
  user: User | null
  dbUser: DbUser | null
  setSession: (session: AnySession | null) => void
  setUser: (user: User | null) => void
  setDbUser: (dbUser: DbUser | null) => void
  logout: () => void

  // UI
  isDark: boolean
  toggleDark: () => void

  // City
  city: string
  setCity: (city: string) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void

  // Favorites
  favoriteIds: string[]
  setFavoriteIds: (ids: string[]) => void
  toggleFavoriteLocal: (id: string) => void

  // Notifications badge
  unreadCount: number
  setUnreadCount: (n: number) => void
}

export function dbUserToUser(db: DbUser): User {
  return {
    id:               db.id,
    email:            db.email,
    name:             db.display_name,
    avatar:           db.avatar_url ?? db.photo_url,
    role:             db.role,
    whatsapp:         db.whatsapp,
    city:             db.city,
    bio:              db.bio,
    verifiedSeller:   db.verified_seller,
    verification:     db.verification ?? 'none',
    trustScore:       db.trust_score ?? 0,
    rating:           db.rating ?? 0,
    totalReviews:     db.total_reviews ?? 0,
    activeListings:   db.active_listings_count ?? 0,
    soldCount:        db.sold_count ?? 0,
    responseTimeHours: db.response_time_hours ?? null,
    createdAt:        db.created_at,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      session:    null,
      user:       null,
      dbUser:     null,
      setSession: (session) => set({ session }),
      setUser:    (user) => set({ user }),
      setDbUser:  (dbUser) => set({
        dbUser,
        user: dbUser ? dbUserToUser(dbUser) : null,
      }),
      logout: () => set({
        session: null, user: null, dbUser: null,
        favoriteIds: [], unreadCount: 0,
      }),

      // UI
      isDark:     false,
      toggleDark: () => set((s) => {
        const next = !s.isDark
        document.documentElement.classList.toggle('dark', next)
        return { isDark: next }
      }),

      // City
      city:    '',
      setCity: (city) => set({ city }),

      // Search
      searchQuery:    '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // Favorites
      favoriteIds:         [],
      setFavoriteIds:      (ids) => set({ favoriteIds: ids }),
      toggleFavoriteLocal: (id) => set((s) => ({
        favoriteIds: s.favoriteIds.includes(id)
          ? s.favoriteIds.filter(f => f !== id)
          : [...s.favoriteIds, id],
      })),

      // Notifications
      unreadCount:    0,
      setUnreadCount: (unreadCount) => set({ unreadCount }),
    }),
    {
      name: 'vitrin-store-v1',
      // فقط تنظیمات UI رو persist کن — session را Supabase خودش مدیریت می‌کند
      partialize: (s) => ({
        isDark:      s.isDark,
        city:        s.city,
        favoriteIds: s.favoriteIds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)
