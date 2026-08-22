export const CITIES = [
  'کابل','هرات','مزارشریف','قندهار','جلال‌آباد','کندز','غزنی','بامیان','لشکرگاه','تالقان',
]

export const CATEGORIES = [
  { id: 'gaming',   label: 'اکانت بازی',      icon: 'Gamepad' },
  { id: 'social',   label: 'پیج و کانال',      icon: 'Radio' },
  { id: 'subs',     label: 'اشتراک سرویس',     icon: 'Key' },
  { id: 'payments', label: 'شارژ و پرداخت',    icon: 'CreditCard' },
  { id: 'design',   label: 'طراحی و گرافیک',   icon: 'PenTool' },
  { id: 'digital',  label: 'خدمات دیجیتال',    icon: 'Monitor' },
  { id: 'ads',      label: 'تبلیغات',           icon: 'Megaphone' },
  { id: 'other',    label: 'سایر',              icon: 'MoreHorizontal' },
]

export const PLATFORMS: Record<string, string[]> = {
  gaming:   ['PUBG Mobile','Free Fire','Call of Duty','FIFA','Steam','Epic Games','PlayStation','Xbox','سایر'],
  social:   ['Instagram','TikTok','YouTube','Telegram','Twitter/X','Facebook','LinkedIn','سایر'],
  subs:     ['Netflix','Spotify','YouTube Premium','Disney+','Apple Music','ChatGPT Plus','Adobe CC','سایر'],
  payments: ['PayPal','Crypto (USDT)','Gift Card','iTunes','Google Play','سایر'],
  design:   ['Canva Pro','Adobe Photoshop','Figma','سایر'],
  digital:  ['آموزش آنلاین','وب‌سایت','اپلیکیشن','سایر'],
  ads:      ['تبلیغات اینستاگرام','تبلیغات گوگل','تبلیغات تلگرام','سایر'],
  other:    ['سایر'],
}

export const PLAN_LIMITS = {
  free:    { listings: 2, featured: 0, photos: 3 },
  basic:   { listings: 10, featured: 1, photos: 6 },
  pro:     { listings: 50, featured: 5, photos: 10 },
  premium: { listings: -1, featured: -1, photos: 15 },
}

export const formatPrice = (price: number, currency = 'AFN'): string => {
  if (price === 0) return 'توافقی'
  return toPersianDigits(price.toLocaleString('fa-AF')) + ' ' + currency
}

export const toPersianDigits = (str: string | number): string => {
  const persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']
  return String(str).replace(/[0-9]/g, d => persian[+d])
}

export const timeAgo = (dateStr: string): string => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)    return 'همین لحظه'
  if (diff < 3600)  return toPersianDigits(Math.floor(diff / 60)) + ' دقیقه پیش'
  if (diff < 86400) return toPersianDigits(Math.floor(diff / 3600)) + ' ساعت پیش'
  if (diff < 2592000) return toPersianDigits(Math.floor(diff / 86400)) + ' روز پیش'
  return toPersianDigits(Math.floor(diff / 2592000)) + ' ماه پیش'
}

export const getCategoryLabel = (id: string) =>
  CATEGORIES.find(c => c.id === id)?.label ?? id
