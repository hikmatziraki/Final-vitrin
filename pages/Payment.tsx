import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, CreditCard, Smartphone, Bitcoin, Check, AlertCircle } from 'lucide-react'
import { toPersianDigits } from '@/utils/constants'

const PAYMENT_METHODS = [
  { id: 'mpesa',   label: 'M-Pesa / موبایل مانی', icon: Smartphone, available: true },
  { id: 'crypto',  label: 'USDT / Crypto',           icon: Bitcoin,   available: true },
  { id: 'card',    label: 'کارت بانکی (به زودی)',    icon: CreditCard, available: false },
]

export default function Payment() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const plan    = params.get('plan') ?? 'basic'
  const price   = Number(params.get('price') ?? 500)

  const PLAN_NAMES: Record<string, string> = { basic: 'بیسیک', pro: 'پرو', premium: 'پرمیوم' }

  const [method, setMethod]     = useState('')
  const [processing, setProc]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  function handlePay() {
    if (!method) { setError('روش پرداخت را انتخاب کنید.'); return }
    setError(''); setProc(true)
    // In production: integrate with actual payment gateway (M-Pesa API, crypto wallet, etc.)
    setTimeout(() => {
      setProc(false)
      setSuccess(true)
    }, 2000)
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Check size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)]">پرداخت موفق! 🎉</h2>
        <p className="text-[var(--text-muted)] text-sm">
          پلان <strong>{PLAN_NAMES[plan]}</strong> با موفقیت فعال شد.
        </p>
        <button onClick={() => navigate('/account')}
          className="h-12 px-8 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold">
          رفتن به حساب
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22} /></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">پرداخت</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Order summary */}
        <div className="card rounded-2xl p-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">خلاصه سفارش</h2>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-secondary)]">پلان {PLAN_NAMES[plan]}</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{toPersianDigits(price.toLocaleString())} AFN</span>
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm font-bold text-[var(--text-primary)]">مجموع</span>
            <span className="text-lg font-black text-emerald-500">{toPersianDigits(price.toLocaleString())} AFN</span>
          </div>
        </div>

        {/* Payment methods */}
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">روش پرداخت</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                disabled={!m.available}
                onClick={() => m.available && setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-right transition-all disabled:opacity-40
                  ${method === m.id
                    ? 'border-[var(--text-primary)] bg-[var(--text-primary)]/5'
                    : 'border-[var(--border-color)]'
                  }`}
              >
                <m.icon size={20} className={method === m.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'} />
                <span className="flex-1 text-sm font-semibold text-[var(--text-primary)]">{m.label}</span>
                {method === m.id && <Check size={16} className="text-[var(--text-primary)]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Payment instructions based on method */}
        {method === 'mpesa' && (
          <div className="bg-blue-500/10 rounded-2xl p-4 text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <p className="font-bold">راهنمای پرداخت M-Pesa:</p>
            <p>۱. به شماره <strong dir="ltr">+93700000000</strong> پول ارسال کنید</p>
            <p>۲. مبلغ: <strong>{price.toLocaleString()} AFN</strong></p>
            <p>۳. در یادداشت: <strong>VITRIN-{plan.toUpperCase()}</strong> بنویسید</p>
            <p>۴. روی «تأیید پرداخت» کلیک کنید</p>
          </div>
        )}

        {method === 'crypto' && (
          <div className="bg-amber-500/10 rounded-2xl p-4 text-sm text-amber-600 dark:text-amber-400 space-y-1">
            <p className="font-bold">پرداخت با USDT (TRC-20):</p>
            <p className="font-mono text-xs break-all" dir="ltr">TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
            <p>مبلغ معادل: <strong>{(price / 85).toFixed(2)} USDT</strong></p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={processing || !method}
          className="w-full h-13 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {processing
            ? <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />در حال پردازش...</>
            : '💳 تأیید پرداخت'
          }
        </button>
      </div>
    </motion.div>
  )
}
