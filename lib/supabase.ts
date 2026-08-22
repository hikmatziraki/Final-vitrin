import { createClient } from '@supabase/supabase-js'

// کلیدها از Vercel Environment Variables خوانده می‌شوند
// هرگز اینجا کلید ننویسید — فقط در Vercel Dashboard وارد کنید
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ─── DB Row Types ──────────────────────────────────────────────
export interface DbUser {
  id: string
  email: string
  display_name: string
  photo_url: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  whatsapp: string | null
  phone: string | null
  city: string | null
  bio: string | null
  verified_seller: boolean
  verification: 'none' | 'pending' | 'verified' | 'rejected'
  trust_score: number
  rating: number
  total_reviews: number
  active_listings_count: number
  sold_count: number
  response_time_hours: number | null
  created_at: string
  updated_at: string
}

export interface DbListing {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  previous_price: number | null
  price_currency: string
  category: 'gaming' | 'social' | 'subs' | 'payments' | 'design' | 'digital' | 'ads' | 'other'
  platform: string
  city: string
  whatsapp: string
  image_url: string | null
  image_urls: string[]
  active: boolean
  featured: boolean
  verified_seller: boolean
  view_count: number
  favorites_count: number
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'paused' | 'sold' | 'expired' | 'removed'
  details: Record<string, unknown>
  published_at: string
  created_at: string
  updated_at: string
  users?: DbUser
}

export interface DbReview {
  id: string
  reviewer_id: string
  reviewee_id: string
  listing_id: string
  rating: number
  comment: string
  verified: boolean
  created_at: string
  reviewer?: DbUser
}

export interface DbConversation {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  last_message_at: string
  last_message_content: string | null
  buyer_unread: number
  seller_unread: number
  created_at: string
  listing?: DbListing
  buyer?: DbUser
  seller?: DbUser
}

export interface DbMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  sender?: DbUser
}

export interface DbNotification {
  id: string
  user_id: string
  type: string
  title: string
  content: string
  link: string | null
  read: boolean
  created_at: string
}
