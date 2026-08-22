import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CITIES } from '@/utils/constants'

export default function Register() {
  const navigate = useNavigate()

  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [whatsapp, setWhatsapp]   = useState('')
  const [city, setCity]           = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  function validate() {
    if (!name.trim() || name.trim().length < 2) return 'نام باید حداقل ۲ حرف باشد.'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'ایمیل معتبر نیست.'
    if (password.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد.'
    if (whatsapp && !/^\+?[0-9]{9,15}$/.test(whatsapp.replace(/\s/g, ''))) {
      return 'شماره واتساپ معتبر نیست. مثال: +93700123456'
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          whatsapp: whatsapp.trim() || null,
        },
      },
    })
    setLoading(false)

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('این ایمیل قبلاً ثبت شده است.')
      } else {
        setError(authError.message || 'خطا در ثبت‌نام.')
      }
      return
    }

    // Update city in profile (will be created by trigger)
    if (city) {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        await supabase.from('users').update({ city, whatsapp: whatsapp || null })
          .eq('id', sessionData.session.user.id)
      }
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm card p-8 rounded-3xl text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">ثبت‌نام موفق!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            لینک تأیید به ایمیل <strong>{email}</strong> ارسال شد. پس از تأیید وارد شوید.
          </p>
          <button onClick={() => navigate('/login')} className="w-full h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold">
            رفتن به صفحه ورود
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-black text-[var(--text-primary)] mb-1">ویترین</h1>
          <p className="text-[var(--text-muted)] text-sm">ایجاد حساب جدید</p>
        </div>

        <div className="card p-6 rounded-3xl">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">ثبت‌نام</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">نام کامل</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-base w-full" placeholder="احمد محمدی" required />
            </div>

            <div>
              <label className="label">ایمیل</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-base w-full" placeholder="example@gmail.com" autoComplete="email" required />
            </div>

            <div>
              <label className="label">رمز عبور <span className="text-[var(--text-muted)] text-xs">(حداقل ۸ کاراکتر)</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-base w-full pl-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" tabIndex={-1}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">واتساپ <span className="text-[var(--text-muted)] text-xs">(اختیاری)</span></label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="input-base w-full" placeholder="+93700000000" dir="ltr" />
            </div>

            <div>
              <label className="label">شهر <span className="text-[var(--text-muted)] text-xs">(اختیاری)</span></label>
              <select value={city} onChange={e => setCity(e.target.value)} className="input-base w-full">
                <option value="">انتخاب شهر...</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {loading
                ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <><UserPlus size={18} /> ثبت‌نام</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            حساب دارید؟{' '}
            <Link to="/login" className="text-[var(--text-primary)] font-semibold underline underline-offset-2">ورود</Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
