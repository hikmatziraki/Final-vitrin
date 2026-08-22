import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'

export default function Terms() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '۱. شرایط عمومی استفاده',
      content: 'با استفاده از سایت ویترین، شما موافقت می‌کنید که از این سرویس مطابق قوانین جمهوری اسلامی افغانستان و مقررات این سایت استفاده کنید. هرگونه استفاده غیرقانونی یا خلاف اخلاق ممنوع است.'
    },
    {
      title: '۲. ثبت اعلان',
      content: 'اعلانات باید واقعی و صادقانه باشند. فروش اجناس غیرقانونی، کالاهای دزدیده‌شده، محتوای مستهجن یا هر چیز مغایر با قانون ممنوع است. ویترین حق دارد هر اعلانی را بدون اطلاع قبلی حذف کند.'
    },
    {
      title: '۳. مسئولیت معاملات',
      content: 'ویترین صرفاً یک بستر تبلیغاتی است و مسئولیتی در قبال معاملات بین خریداران و فروشندگان ندارد. قبل از پرداخت، اطمینان حاصل کنید که فروشنده معتبر است. از پرداخت قبل از دریافت کالا خودداری کنید.'
    },
    {
      title: '۴. حریم خصوصی',
      content: 'اطلاعات شخصی شما (نام، ایمیل، شماره تماس) برای بهبود سرویس استفاده می‌شود و به اشخاص ثالث فروخته نمی‌شود. برای اطلاعات بیشتر به سیاست حریم خصوصی ما مراجعه کنید.'
    },
    {
      title: '۵. قوانین ممنوعه',
      content: `موارد زیر در ویترین ممنوع است:\n• فروش کالاهای غیرقانونی یا قاچاق\n• اطلاعات دزدیده‌شده یا هک‌شده\n• کلاهبرداری و جعل هویت\n• اسپم و تبلیغات گمراه‌کننده\n• محتوای مستهجن یا توهین‌آمیز`
    },
    {
      title: '۶. تغییرات شرایط',
      content: 'ویترین حق دارد این شرایط را هر زمان تغییر دهد. ادامه استفاده از سایت بعد از اعلام تغییرات به منزله پذیرش شرایط جدید است.'
    },
    {
      title: '۷. تماس با ما',
      content: 'برای هرگونه سوال یا گزارش تخلف، از طریق صفحه پشتیبانی با ما در تماس باشید.'
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-safe">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="text-[var(--text-muted)]"><ChevronRight size={22} /></button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">قوانین و مقررات</h1>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-5 max-w-2xl">
        <div className="card rounded-2xl p-4">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            آخرین بروزرسانی: دلو ۱۴۰۳
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="card rounded-2xl p-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">{s.title}</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
