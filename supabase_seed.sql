-- ============================================================
-- VITRIN SEED DATA
-- Run this in Supabase SQL editor AFTER creating the admin user
-- through the app's register page.
-- ============================================================

-- Step 1: Register admin user via the app at /register
-- Email: admin@vitrin.af  Password: Admin@12345

-- Step 2: Find their UUID then run:
-- UPDATE public.users SET role = 'admin', verified_seller = true, verification = 'verified'
-- WHERE email = 'admin@vitrin.af';

-- ============================================================
-- Sample listings (replace SELLER_UUID with a real seller's ID)
-- ============================================================

-- To insert sample data:
-- 1. Register a test seller account via the app
-- 2. Find their UUID: SELECT id FROM public.users WHERE email = 'seller@test.com';
-- 3. Replace :SELLER_UUID below with the actual UUID

/*
INSERT INTO public.listings
  (seller_id, title, description, price, category, platform, city, whatsapp, image_urls, status, active, featured)
VALUES
  (
    'SELLER_UUID',
    'اکانت PUBG Mobile رنک کنگ رویال ۸۵+',
    'اکانت PUBG Mobile با رنک کنگ رویال ۸۵ در فصل فعلی. دارای M416 گلد سطح ۷، اسکین‌های نادر متعدد، UC موجود ۲۰۰۰. اکانت کاملاً سالم و اماده تحویل فوری.',
    3500,
    'gaming',
    'PUBG Mobile',
    'کابل',
    '+93700123456',
    ARRAY['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'],
    'published',
    true,
    true
  ),
  (
    'SELLER_UUID',
    'پیج اینستاگرام ۵۰K فالوور - آشپزی',
    'پیج آشپزی با ۵۰ هزار فالوور واقعی ایرانی-افغانی. نرخ engagement عالی ۸٪، ۳ سال سابقه، محتوا منظم. درآمد ماهانه از تبلیغات.',
    12000,
    'social',
    'Instagram',
    'هرات',
    '+93700234567',
    ARRAY['https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400'],
    'published',
    true,
    false
  ),
  (
    'SELLER_UUID',
    'اشتراک Netflix پریمیوم ۱ ماهه',
    'اشتراک Netflix پریمیوم با کیفیت ۴K برای ۱ ماه. اکانت شخصی، پشتیبانی ۲۴/۷، تحویل فوری بعد از پرداخت.',
    800,
    'subs',
    'Netflix',
    'مزارشریف',
    '+93700345678',
    ARRAY['https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400'],
    'published',
    true,
    false
  );
*/
