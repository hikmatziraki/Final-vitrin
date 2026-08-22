import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronRight, Moon, Sun, Check, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore, dbUserToUser } from '@/store/useAppStore'
import { CITIES } from '@/utils/constants'
import type { DbUser } from '@/lib/supabase'

export default function Settings() {
  const navigate = useNavigate()
  const { user, dbUser, isDark, toggleDark, setDbUser } = useAppStore()

  const [name, setName]         = useState(dbUser?.display_name ?? '')
  const [whatsapp, setWhatsapp] = useState(dbUser?.whatsapp ?? '')
  const [city, setCity]         = useState(dbUser?.city ?? '')
  const [bio, setBio]           = useState(dbUser?.bio ?? '')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  async function handleSave() {
    if (!user) return
    setError('')

    if (!name.trim() || name.trim().length < 2) { setError('نام باید حداقل ۲ حرف باشد.'); return }
    if (whatsapp && !/^\+?[0-9]{9,15}$/.test(whatsapp.replace(/\s/g, ''))) {
      setError('شماره واتساپ معتبر نیست. مثال: +93700000000')
      return
    }

    setSaving(true)
    const updates: Partial<DbUser> = {
      display_name: name.trim(),
      whatsapp: whatsapp.trim() || null,
      city: city || null,
      bio: bio.trim() || null,
    }

    const { data, error: updateErr } = await supabase
      .from('users').update(updates).eq('id', user.id).select().single()

    setSaving(false)
    if (updateErr) { setError('خطا در ذخیره‌سازی: ' + updateErr.message); return }
    if (data) setDbUser(data as DbUser)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handlePasswordChange() {
    if (!user?.email) return
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(user.email)
    if (!resetErr) alert('لینک تغییر رمز به ایمیل شما ارسال شد.')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      {/* Back */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={24} /></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات</h1>
      </div>

      <div className="px-4 space-y-4 mt-2">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Profile */}
        <div className="card rounded-3xl p-5 space-y-4">
          <h2 className="font-bold text-[var(--text-primary)] text-sm">اطلاعات پروفایل</h2>

          <div>
            <label className="label">نام</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-base w-full mt-1.5" placeholder="نام شما" maxLength={60} />
          </div>

          <div>
            <label className="label">واتساپ</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="input-base w-full mt-1.5" placeholder="+93700000000" dir="ltr" />
          </div>

          <div>
            <label className="label">شهر</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="input-base w-full mt-1.5">
              <option value="">انتخاب شهر</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">بیوگرافی <span className="text-[var(--text-muted)] text-xs">(اختیاری، {bio.length}/200)</span></label>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 200))}
              className="input-base w-full mt-1.5 resize-none" rows={3} placeholder="درباره خودتان بنویسید..." maxLength={200} />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving
              ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : saved
                ? <><Check size={18} /> ذخیره شد!</>
                : 'ذخیره تغییرات'
            }
          </button>
        </div>

        {/* Appearance */}
        <div className="card rounded-3xl p-5">
          <h2 className="font-bold text-[var(--text-primary)] text-sm mb-4">ظاهر</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={20} className="text-[var(--text-primary)]" /> : <Sun size={20} className="text-[var(--text-primary)]" />}
              <span className="text-sm text-[var(--text-primary)]">{isDark ? 'حالت شب' : 'حالت روز'}</span>
            </div>
            {/* RTL-correct toggle: track goes right(off)→left(on) in RTL layout */}
            <button onClick={toggleDark}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-[var(--text-primary)]' : 'bg-[var(--border-color)]'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-[var(--bg-color)] shadow transition-all duration-300 ${isDark ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="card rounded-3xl p-5">
          <h2 className="font-bold text-[var(--text-primary)] text-sm mb-4">امنیت</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[var(--text-secondary)]">ایمیل</span>
              <span className="text-sm text-[var(--text-muted)] truncate max-w-[55%]">{user?.email}</span>
            </div>
            <button onClick={handlePasswordChange}
              className="w-full h-11 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)] mt-1">
              تغییر رمز عبور (از طریق ایمیل)
            </button>
          </div>
        </div>

        {/* Account info */}
        <div className="card rounded-3xl p-5">
          <h2 className="font-bold text-[var(--text-primary)] text-sm mb-3">اطلاعات حساب</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">نقش</span>
              <span className="text-[var(--text-secondary)]">{user?.role === 'admin' ? 'مدیر' : 'کاربر'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">وضعیت تأیید</span>
              <span className={`font-semibold ${user?.verification === 'verified' ? 'text-blue-500' : 'text-[var(--text-muted)]'}`}>
                {user?.verification === 'verified' ? 'تأیید شده ✓' : user?.verification === 'pending' ? 'در انتظار بررسی' : 'تأیید نشده'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] pb-4">ویترین — نسخه ۱.۰.۰</p>
      </div>
    </motion.div>
  )
}
