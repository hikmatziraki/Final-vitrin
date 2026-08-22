import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, ChevronRight, Zap, Crown, Star } from 'lucide-react'

const PLANS = [
  {
    id: 'basic',
    name: 'بیسیک',
    price: 500,
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    features: ['۱۰ اعلان فعال', '۱ اعلان ویژه در ماه', '۶ تصویر در هر اعلان', 'پشتیبانی ایمیل'],
  },
  {
    id: 'pro',
    name: 'پرو',
    price: 1500,
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/50',
    featured: true,
    features: ['۵۰ اعلان فعال', '۵ اعلان ویژه در ماه', '۱۰ تصویر در هر اعلان', 'نشان تأیید فروشنده', 'پشتیبانی اولویت‌دار'],
  },
  {
    id: 'premium',
    name: 'پرمیوم',
    price: 3000,
    icon: Crown,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    features: ['اعلان نامحدود', 'اعلان ویژه نامحدود', '۱۵ تصویر در هر اعلان', 'نشان تأیید طلایی', 'پشتیبانی VIP واتساپ'],
  },
]

export default function Upgrade() {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22} /></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">ارتقاء حساب</h1>
      </div>

      <div className="px-4 pt-4 space-y-4 pb-8">
        <p className="text-sm text-[var(--text-muted)] text-center">
          با ارتقاء حساب، اعلانات بیشتری ثبت کنید و فروش بیشتری داشته باشید.
        </p>

        {PLANS.map(plan => (
          <div key={plan.id}
            className={`card rounded-3xl p-5 border-2 relative ${plan.featured ? plan.border : 'border-[var(--border-color)]'}`}>
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-3 py-0.5 rounded-full">
                محبوب‌ترین ⭐
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl ${plan.bg} flex items-center justify-center ${plan.color}`}>
                <plan.icon size={22} />
              </div>
              <div>
                <h3 className="font-black text-[var(--text-primary)] text-base">{plan.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">ماهانه</p>
              </div>
              <div className="mr-auto text-left">
                <span className="text-2xl font-black text-[var(--text-primary)]">{plan.price.toLocaleString()}</span>
                <span className="text-xs text-[var(--text-muted)]"> AFN</span>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Check size={15} className="text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/payment?plan=${plan.id}&price=${plan.price}`)}
              className={`w-full h-12 rounded-2xl font-bold text-sm transition-colors
                ${plan.featured
                  ? 'bg-[var(--text-primary)] text-[var(--bg-color)]'
                  : 'border border-[var(--border-color)] text-[var(--text-primary)]'
                }`}
            >
              خرید پلان {plan.name}
            </button>
          </div>
        ))}

        <p className="text-center text-xs text-[var(--text-muted)]">
          پس از پرداخت، پلان بلافاصله فعال می‌شود.
        </p>
      </div>
    </motion.div>
  )
}
