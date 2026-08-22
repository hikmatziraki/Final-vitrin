import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Flag, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { timeAgo } from '@/utils/constants'

interface Report {
  id: string; listing_id: string; reporter_id: string; reason: string; status: string; created_at: string;
  listing?: { id: string; title: string }; reporter?: { id: string; display_name: string }
}

export default function AdminReports() {
  const [reports, setReports]   = useState<Report[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.from('reports')
      .select('*, listing:listing_id(id,title), reporter:reporter_id(id,display_name)')
      .eq('status', 'pending').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setReports(data as Report[] ?? []); setLoading(false) })
  }, [])

  async function dismiss(id: string) {
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  async function removeAndDismiss(report: Report) {
    if (!confirm('اعلان حذف و گزارش بسته شود؟')) return
    await Promise.all([
      supabase.from('listings').update({ status: 'removed', active: false }).eq('id', report.listing_id),
      supabase.from('reports').update({ status: 'reviewed' }).eq('id', report.id),
    ])
    setReports(prev => prev.filter(r => r.id !== report.id))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
      <h1 className="text-xl font-black text-[var(--text-primary)]">گزارش‌های تخلف</h1>

      {loading
        ? <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="card rounded-2xl h-24 animate-pulse"/>)}</div>
        : reports.length === 0
          ? <div className="text-center py-12"><Flag size={40} className="mx-auto text-[var(--border-color)] mb-2"/><p className="text-[var(--text-muted)]">هیچ گزارش جدیدی وجود ندارد ✅</p></div>
          : <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="card rounded-2xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <a href={`/listings/${r.listing_id}`} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold text-[var(--text-primary)] hover:underline line-clamp-1">
                          {(r.listing as any)?.title ?? 'اعلان حذف شده'}
                        </a>
                        <p className="text-xs text-[var(--text-muted)]">گزارش از: {(r.reporter as any)?.display_name} · {timeAgo(r.created_at)}</p>
                      </div>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                      <p className="text-xs text-[var(--text-secondary)]">{r.reason}</p>
                    </div>
                  </div>
                  <div className="flex border-t border-[var(--border-color)] divide-x divide-[var(--border-color)]">
                    <button onClick={() => dismiss(r.id)} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-[var(--text-muted)]">
                      <X size={14}/> نادیده
                    </button>
                    <button onClick={() => removeAndDismiss(r)} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-red-500">
                      <Check size={14}/> حذف اعلان
                    </button>
                  </div>
                </div>
              ))}
            </div>
      }
    </motion.div>
  )
}
