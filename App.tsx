import { useEffect } from 'react'
import { AppRouter } from './AppRouter'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import type { DbUser } from '@/lib/supabase'

export default function App() {
  const { setSession, setDbUser, logout, isDark } = useAppStore()

  // اعمال dark mode در mount اولیه
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // گوش دادن به تغییرات Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setDbUser(data as DbUser)

      // sync favorites
      const { data: favs } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId)
      if (favs) {
        useAppStore.getState().setFavoriteIds(favs.map((f: { listing_id: string }) => f.listing_id))
      }

      // تعداد اعلان‌های خوانده‌نشده
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
      useAppStore.getState().setUnreadCount(count ?? 0)
    }
  }

  return <AppRouter />
}
