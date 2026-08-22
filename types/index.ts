// ─── App-level types (mapped from DB) ──────────────────────────

export type UserRole = 'user' | 'admin'
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected'
export type ListingStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'paused' | 'sold' | 'expired' | 'removed'
export type ListingCategory = 'gaming' | 'social' | 'subs' | 'payments' | 'design' | 'digital' | 'ads' | 'other'

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  role: UserRole
  whatsapp: string | null
  city: string | null
  bio: string | null
  verifiedSeller: boolean
  verification: VerificationStatus
  trustScore: number
  rating: number
  totalReviews: number
  activeListings: number
  soldCount: number
  responseTimeHours: number | null
  createdAt: string
}

export interface Listing {
  id: string
  sellerId: string
  title: string
  description: string
  price: number
  previousPrice: number | null
  currency: string
  category: ListingCategory
  platform: string
  city: string
  whatsapp: string
  images: string[]
  featured: boolean
  verifiedSeller: boolean
  viewCount: number
  favoritesCount: number
  status: ListingStatus
  details: Record<string, unknown>
  publishedAt: string
  createdAt: string
  seller?: User
}

export interface Review {
  id: string
  reviewerId: string
  revieweeId: string
  listingId: string
  rating: number
  comment: string
  verified: boolean
  createdAt: string
  reviewer?: User
}

export interface Conversation {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  lastMessageAt: string
  lastMessageContent: string | null
  buyerUnread: number
  sellerUnread: number
  createdAt: string
  listing?: Listing
  buyer?: User
  seller?: User
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
  sender?: User
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  link: string | null
  read: boolean
  createdAt: string
}
