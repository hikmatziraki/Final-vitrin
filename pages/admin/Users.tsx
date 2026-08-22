import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { CheckCircle, ShieldOff, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { timeAgo } from '@/utils/constants'
import type { DbUser } from '@/lib/supabase'

export default function AdminUsers() {
  const [users, setUsers]       = useState<DbUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    supabase.from('users').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setUsers(data ?? []); setLoading(false) })
  }, [])

  async function toggleVerify(user: DbUser) {
    const verified = !user.verified_seller
    await supabase.from('users').update({ verified_seller: verified, verification: verified ? 'verified' : 'none' }).eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, verified_seller: verified, verification: verified ? 'verified' : 'none' } : u))
  }

  async function toggleAdmin(user: DbUser) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await supabase.from('users').update({ role: newRole }).eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
  }

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
      <h1 className="text-xl font-black text-[var(--text-primary)]">مدیریت کاربران</h1>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} className="input-base w-full pr-9" placeholder="جستجوی نام یا ایمیل..."/>
      </div>

      {loading
        ? <div className="space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="card rounded-2xl h-16 animate-pulse"/>)}</div>
        : <div className="space-y-2">
            {filtered.map(u => (
              <div key={u.id} className="card rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-color)] overflow-hidden shrink-0 flex items-center justify-center text-lg font-bold text-[var(--text-muted)]">
                  {u.avatar_url || u.photo_url ? <img src={u.avatar_url ?? u.photo_url!} className="w-full h-full object-cover" alt=""/> : u.display_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.display_name}</p>
                    {u.verified_seller && <CheckCircle size={13} className="text-blue-500 shrink-0"/>}
                    {u.role === 'admin' && <span className="text-[10px] bg-red-500 text-white px-1.5 rounded-full font-bold shrink-0">admin</span>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">{u.email} · {timeAgo(u.created_at)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleVerify(u)}
                    className={`text-xs px-2 py-1 rounded-lg font-semibold ${u.verified_seller ? 'bg-blue-500/10 text-blue-500' : 'bg-[var(--surface-color)] text-[var(--text-muted)]'}`}>
                    {u.verified_seller ? '✓ تأیید' : 'تأیید'}
                  </button>
                  <button onClick={() => toggleAdmin(u)}
                    className={`text-xs px-2 py-1 rounded-lg font-semibold ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-[var(--surface-color)] text-[var(--text-muted)]'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
      }
    </motion.div>
  )
}
