import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, X, Check, AlertCircle, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { CATEGORIES, CITIES, PLATFORMS } from '@/utils/constants'

export default function PostWizard() {
  const navigate = useNavigate()
  const { user, session } = useAppStore()

  // ── همه hooks قبل از هر conditional return ──────────────────
  const [step, setStep]             = useState(1)
  const [category, setCategory]     = useState('')
  const [platform, setPlatform]     = useState('')
  const [title, setTitle]           = useState('')
  const [description, setDesc]      = useState('')
  const [price, setPrice]           = useState('')
  const [whatsapp, setWhatsapp]     = useState(user?.whatsapp ?? '')
  const [city, setCity]             = useState(user?.city ?? '')
  const [images, setImages]         = useState<string[]>([])
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [listingId, setListingId]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const TOTAL = 6

  // ── Conditional returns بعد از hooks ────────────────────────
  if (!session || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6 text-center">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">ابتدا وارد شوید</h2>
        <p className="text-sm text-[var(--text-muted)]">برای ثبت اعلان به حساب کاربری نیاز دارید.</p>
        <button onClick={() => navigate('/login?next=/post')}
          className="h-12 px-8 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold">
          ورود
        </button>
      </div>
    )
  }

  // ── از اینجا به بعد TypeScript می‌داند user null نیست ──────
  const currentUser = user  // non-null

  function isStepValid() {
    switch (step) {
      case 1: return !!category
      case 2: return title.trim().length >= 3 && description.trim().length >= 10
      case 3: return true
      case 4: return /^\+?[0-9]{9,15}$/.test(whatsapp.replace(/\s/g, '')) && !!city
      case 5: return images.length > 0
      default: return true
    }
  }

  async function handleImageUpload(files: FileList) {
    if (images.length >= 6) return
    setUploading(true)
    setError('')
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      if (images.length + uploaded.length >= 6) break
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) { setError('حجم تصویر نباید از ۱۰MB بیشتر باشد.'); continue }

      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error: uploadErr } = await supabase.storage
        .from('listing-images').upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadErr) { setError('خطا در آپلود: ' + uploadErr.message); continue }

      const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(data.path)
      uploaded.push(publicUrl)
    }

    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    const { data, error: insertErr } = await supabase.from('listings').insert({
      seller_id:     currentUser.id,
      category,
      platform,
      title:         title.trim(),
      description:   description.trim(),
      price:         Number(price) || 0,
      price_currency: 'AFN',
      whatsapp:      whatsapp.trim(),
      city,
      image_urls:    images,
      image_url:     images[0] ?? null,
      status:        'published',
      active:        true,
    }).select('id').single()

    setSubmitting(false)
    if (insertErr) { setError('خطا در ثبت: ' + insertErr.message); return }
    setListingId(data.id)
    setStep(7)
  }

  function handleNext() {
    if (!isStepValid()) return
    if (step === 6) { handleSubmit(); return }
    setStep(s => s + 1)
  }

  const progress = Math.min((step / TOTAL) * 100, 100)

  if (step === 7) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Check size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)]">اعلان ثبت شد! 🎉</h2>
        <p className="text-sm text-[var(--text-muted)]">اعلان شما با موفقیت منتشر شد.</p>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => navigate(`/listings/${listingId}`)}
            className="flex-1 h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold text-sm">
            مشاهده اعلان
          </button>
          <button onClick={() => navigate('/my-listings')}
            className="flex-1 h-12 rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] font-semibold text-sm">
            اعلانات من
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-36">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--bg-color)] z-10 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="text-[var(--text-muted)]">
            <ChevronRight size={24} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-[var(--text-muted)]">مرحله {step} از {TOTAL}</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {['','دسته‌بندی','توضیحات','قیمت','اطلاعات تماس','تصاویر','پیش‌نمایش'][step]}
            </p>
          </div>
        </div>
        <div className="h-1.5 bg-[var(--surface-color)] rounded-full overflow-hidden">
          <motion.div animate={{ width: `${progress}%` }} className="h-full bg-[var(--text-primary)] rounded-full" />
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-red-500/10 text-red-500 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5">

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">چه چیزی می‌فروشید؟</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => { setCategory(cat.id); setPlatform('') }}
                    className={`p-4 rounded-2xl border-2 text-right transition-all ${category === cat.id ? 'border-[var(--text-primary)] bg-[var(--text-primary)]/5' : 'border-[var(--border-color)]'}`}>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{cat.label}</p>
                  </button>
                ))}
              </div>
              {category && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                  <label className="label mb-2">پلتفرم</label>
                  <div className="flex flex-wrap gap-2">
                    {(PLATFORMS[category] ?? []).map(p => (
                      <button key={p} onClick={() => setPlatform(p)}
                        className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${platform === p ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-color)]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">عنوان ({title.length}/100)</label>
                <input value={title} onChange={e => setTitle(e.target.value.slice(0, 100))}
                  className="input-base mt-1.5" placeholder="مثال: اکانت PUBG رنک کنگ رویال" maxLength={100} />
              </div>
              <div>
                <label className="label">توضیحات ({description.length}/1000)</label>
                <textarea value={description} onChange={e => setDesc(e.target.value.slice(0, 1000))}
                  className="input-base mt-1.5 min-h-32 resize-none" placeholder="جزئیات کامل..." rows={5} />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="label">قیمت (افغانی)</label>
                <div className="relative mt-1.5">
                  <input value={price} onChange={e => setPrice(e.target.value.replace(/\D/g, ''))}
                    className="input-base pl-14" placeholder="0" type="text" inputMode="numeric" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">AFN</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">صفر = «توافقی»</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000, 10000].map(p => (
                  <button key={p} onClick={() => setPrice(String(p))}
                    className={`px-3 py-1.5 rounded-xl border text-sm ${price === String(p) ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-color)]' : 'border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                    {p.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="label">شماره واتساپ</label>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  className="input-base mt-1.5" placeholder="+93700000000" dir="ltr" type="tel" />
              </div>
              <div>
                <label className="label">شهر</label>
                <select value={city} onChange={e => setCity(e.target.value)} className="input-base mt-1.5">
                  <option value="">انتخاب شهر...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[var(--text-primary)]">تصاویر ({images.length}/6)</h2>
                <p className="text-xs text-[var(--text-muted)]">حداقل ۱ تصویر</p>
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => e.target.files && handleImageUpload(e.target.files)} />
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--surface-color)]">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1 left-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">اصلی</span>}
                  </div>
                ))}
                {images.length < 6 && (
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] disabled:opacity-50">
                    {uploading
                      ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <><Upload size={20} /><span className="text-xs">آپلود</span></>
                    }
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 6 */}
          {step === 6 && (
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">پیش‌نمایش</h2>
              <div className="card rounded-2xl overflow-hidden">
                {images[0] && <img src={images[0]} className="w-full aspect-video object-cover" alt={title} />}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-[var(--text-muted)]">{CATEGORIES.find(c => c.id === category)?.label} · {platform}</p>
                  <p className="font-bold text-[var(--text-primary)]">{title}</p>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-3">{description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-emerald-500 font-black text-lg">
                      {Number(price) > 0 ? `${Number(price).toLocaleString()} AFN` : 'توافقی'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{city}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-500/10 rounded-2xl text-sm text-blue-500">
                ✅ همه چیز درست است؟ برای ثبت نهایی تأیید کنید.
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Bottom button */}
      <div className="fixed bottom-[60px] md:bottom-0 right-0 left-0 bg-[var(--bg-color)] border-t border-[var(--border-color)] p-4 z-20"
           style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={handleNext} disabled={!isStepValid() || submitting || uploading}
            className="w-full h-[52px] rounded-2xl bg-[var(--text-primary)] text-[var(--bg-color)] font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting
              ? <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> در حال ثبت...</>
              : step === 6 ? '✅ ثبت نهایی' : 'ادامه →'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
