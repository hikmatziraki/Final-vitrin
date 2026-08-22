import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const nextUrl = params.get('next') || '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    setLoading(false)

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('ایمیل یا رمز عبور اشتباه است.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('لطفاً ایمیل خود را تأیید کنید.')
      } else {
        setError('خطا در ورود. دوباره امتحان کنید.')
      }
      return
    }

    navigate(nextUrl, { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[90vh] flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-black text-[var(--text-primary)] mb-1">ویترین</h1>
          <p className="text-[var(--text-muted)] text-sm">مارکت‌پلیس دیجیتال افغانستان</p>
        </div>

        <div className="card p-6 rounded-3xl">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">ورود به حساب</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">ایمیل</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                autoComplete="email"
                className="input-base w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">رمز عبور</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-base w-full pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <><LogIn size={18} /> ورود</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            حساب ندارید؟{' '}
            <Link to="/register" className="text-[var(--text-primary)] font-semibold underline underline-offset-2">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
