import { motion } from 'motion/react'
import { Settings } from 'lucide-react'

export default function AdminSettings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-5">
      <h1 className="text-xl font-black text-[var(--text-primary)]">تنظیمات سیستم</h1>

      <div className="card rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Settings size={16}/>وضعیت سرویس</h2>
        {[
          { label: 'Supabase Database',  status: 'online' },
          { label: 'Supabase Auth',      status: 'online' },
          { label: 'Supabase Storage',   status: 'online' },
          { label: 'Vercel Deployment',  status: 'online' },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between py-1">
            <span className="text-sm text-[var(--text-secondary)]">{s.label}</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>فعال
            </span>
          </div>
        ))}
      </div>

      <div className="card rounded-2xl p-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">محدودیت‌های پلان رایگان</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[var(--text-muted)]">حداکثر اعلان</span><span className="font-semibold text-[var(--text-primary)]">۲ اعلان</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-muted)]">حداکثر تصویر</span><span className="font-semibold text-[var(--text-primary)]">۳ تصویر</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-muted)]">اعلان ویژه</span><span className="font-semibold text-[var(--text-muted)]">—</span></div>
        </div>
      </div>

      <div className="card rounded-2xl p-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">لینک‌های مفید</h2>
        <div className="space-y-2">
          {[
            ['Supabase Dashboard', 'https://supabase.com/dashboard'],
            ['Vercel Dashboard', 'https://vercel.com/dashboard'],
          ].map(([label, url]) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between py-1.5 text-sm text-[var(--text-primary)] hover:text-[var(--text-muted)] transition-colors">
              <span>{label}</span>
              <span className="text-xs text-[var(--text-muted)]">↗</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
