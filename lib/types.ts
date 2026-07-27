export type UserRole = 'user' | 'admin';

export type PlanType = 'free' | 'pro';

export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  bairro: string;
  city: string; // Defaults to 'Quelimane'
  bio: string;
  role: UserRole;
  plan: PlanType;
  verificationStatus: VerificationStatus;
  documentType?: 'bi' | 'nuit' | 'licenca';
  documentNumber?: string;
  documentUrl?: string;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ListingType = 'servico' | 'produto';

export type AdStatus = 'pending_approval' | 'active' | 'paused' | 'expired' | 'rejected';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  type: ListingType | 'ambos';
  subcategories: string[];
}

export interface Ad {
  id: string;
  userId: string;
  user?: UserProfile;
  title: string;
  slug: string;
  description: string;
  listingType: ListingType;
  categoryId: string;
  categoryName?: string;
  subcategory: string;
  price: number | null; // null means 'A combinar'
  priceType: 'fixed' | 'negotiable' | 'starting_at';
  bairro: string;
  images: string[];
  coverImage: string;
  phone: string;
  whatsapp: string;
  status: AdStatus;
  isFeatured: boolean;
  featuredUntil?: string;
  viewsCount: number;
  contactsCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface Message {
  id: string;
  adId: string;
  adTitle?: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  receiverName?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  adId?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  adId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  adId?: string;
  reportedUserId?: string;
  reason: 'spam' | 'fraud' | 'inappropriate' | 'fake_contact' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  documentType: 'bi' | 'nuit' | 'licenca';
  documentNumber: string;
  documentImageUrl: string;
  documentBackImageUrl?: string;
  documentImagePath?: string;
  documentBackImagePath?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface SystemSettings {
  freePlanMaxAds: number;
  adValidityDays: number;
  featuredPriceMZN: number;
  proPlanPriceMonthlyMZN: number;
  autoApproveAds: boolean;
  mpesaMerchantNumber: string;
  emolaMerchantNumber: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ad_approved' | 'ad_rejected' | 'ad_expired' | 'message' | 'review' | 'verification';
  read: boolean;
  link?: string;
  createdAt: string;
}
