import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Package, Eye, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { toPersianDigits } from '@/utils/constants'

export default function AdminDashboard() {
  // Use store for isDark — reactive to theme changes
  const { isDark } = useAppStore()

  const [stats, setStats]   = useState({ users: 0, listings: 0, pending: 0, reports: 0, views: 0 })
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState<{ day: string; listings: number }[]>([])

  useEffect(() => {
    async function loadStats() {
      const [
        { count: users },
        { count: listings },
        { count: pending },
        { count: reports },
        { data: viewData },
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('listings').select('view_count').eq('status', 'published'),
      ])

      const totalViews = (viewData ?? []).reduce((s: number, l: any) => s + (l.view_count ?? 0), 0)
      setStats({ users: users ?? 0, listings: listings ?? 0, pending: pending ?? 0, reports: reports ?? 0, views: totalViews })

      // Build last-7-days chart data
      const now = new Date()
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().slice(0, 10)
      })
      const chartData = days.map(day => ({ day: day.slice(5), listings: Math.floor(Math.random() * 8) })) // stub - replace with real query
      setWeekData(chartData)
      setLoading(false)
    }
    loadStats()
  }, [])

  const COLORS = isDark
    ? ['#60a5fa', '#34d399', '#fbbf24', '#f87171']
    : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  const statCards = [
    { label: 'کاربران',     value: stats.users,    icon: Users,        color: 'text-blue-500',   bg: 'bg-blue-500/10' },
    { label: 'اعلانات فعال', value: stats.listings, icon: Package,      color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'در انتظار',   value: stats.pending,  icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-500/10' },
    { label: 'گزارش‌ها',    value: stats.reports,  icon: AlertTriangle, color: 'text-red-500',   bg: 'bg-red-500/10' },
    { label: 'بازدیدها',    value: stats.views,    icon: Eye,          color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-8 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">داشبورد</h1>
        <p className="text-sm text-[var(--text-muted)]">مرور کلی سیستم</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statCards.map(s => (
          <div key={s.label} className={`card rounded-2xl p-4 ${loading ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{loading ? '—' : toPersianDigits(s.value.toLocaleString())}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card rounded-3xl p-5">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">اعلانات ۷ روز اخیر</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="listings" stroke={COLORS[0]} fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card rounded-3xl p-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">اقدامات سریع</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'بررسی اعلانات',  href: '/admin/listings', icon: Package,      color: 'text-emerald-500' },
            { label: 'مدیریت گزارش‌ها', href: '/admin/reports',  icon: AlertTriangle, color: 'text-red-500' },
            { label: 'کاربران',         href: '/admin/users',    icon: Users,         color: 'text-blue-500' },
            { label: 'تنظیمات سیستم',   href: '/admin/settings', icon: CheckCircle,   color: 'text-amber-500' },
          ].map(a => (
            <a key={a.href} href={a.href}
              className="card rounded-2xl p-3 flex items-center gap-2 active:scale-95 transition-transform">
              <a.icon size={16} className={a.color} />
              <span className="text-xs font-semibold text-[var(--text-primary)]">{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
