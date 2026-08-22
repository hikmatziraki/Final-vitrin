import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, Send, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

export default function Support() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [subject, setSubject]   = useState('')
  const [message, setMessage]   = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) { setError('همه فیلدها الزامی هستند.'); return }
    setSending(true); setError('')

    const { error: err } = await supabase.from('contact_messages').insert({
      name:    user?.name ?? 'مهمان',
      email:   user?.email ?? 'guest',
      message: `موضوع: ${subject}\n\n${message}`,
    })

    setSending(false)
    if (err) { setError('خطا در ارسال. دوباره امتحان کنید.'); return }
    setSent(true)
  }

  if (sent) return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check size={32} className="text-emerald-500"/></div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">پیام ارسال شد! ✅</h2>
      <p className="text-[var(--text-muted)] text-sm">تیم پشتیبانی ویترین تا ۲۴ ساعت پاسخ می‌دهد.</p>
      <button onClick={() => navigate(-1)} className="h-12 px-8 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold">بازگشت</button>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pb-safe">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22}/></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">پشتیبانی</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* FAQ quick links */}
        <div className="card rounded-2xl p-4 space-y-2">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">سؤالات متداول</h2>
          {['چطور اعلان ثبت کنم؟','چطور کاربر تأیید شده شوم؟','قوانین استفاده از ویترین'].map(q => (
            <button key={q} className="w-full text-right text-sm text-[var(--text-secondary)] py-2 border-b border-[var(--border-color)] last:border-0">{q}</button>
          ))}
        </div>

        {/* Contact form */}
        <div className="card rounded-2xl p-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">ارسال پیام</h2>
          {error && <div className="text-red-500 text-xs mb-3 bg-red-500/10 px-3 py-2 rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">موضوع</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} className="input-base w-full mt-1" placeholder="مشکل یا سؤال شما" maxLength={100}/>
            </div>
            <div>
              <label className="label">پیام <span className="text-[var(--text-muted)] text-xs">({message.length}/1000)</span></label>
              <textarea value={message} onChange={e=>setMessage(e.target.value.slice(0,1000))} className="input-base w-full mt-1 resize-none" rows={5} placeholder="توضیح دهید..." maxLength={1000}/>
            </div>
            <button type="submit" disabled={sending} className="w-full h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {sending ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <><Send size={17}/>ارسال پیام</>}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div className="text-center text-xs text-[var(--text-muted)] py-2 space-y-1">
          <p>واتساپ پشتیبانی: <span dir="ltr">+93700000000</span></p>
          <p>ساعات کاری: ۸ صبح تا ۱۰ شب (شنبه تا پنجشنبه)</p>
        </div>
      </div>
    </motion.div>
  )
}
