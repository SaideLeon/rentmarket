import { 
  Ad, 
  Category, 
  UserProfile, 
  Review, 
  Message, 
  Favorite, 
  Report, 
  VerificationRequest, 
  SystemSettings, 
  Notification, 
  AdStatus,
  PlanType,
  UserRole
} from './types';
import { 
  INITIAL_ADS, 
  INITIAL_CATEGORIES, 
  INITIAL_USERS, 
  INITIAL_REVIEWS, 
  INITIAL_SETTINGS,
  QUELIMANE_BAIRROS 
} from './data/initialData';

const STORE_KEYS = {
  USERS: 'mq_users',
  CURRENT_USER_ID: 'mq_current_user_id',
  ADS: 'mq_ads',
  CATEGORIES: 'mq_categories',
  REVIEWS: 'mq_reviews',
  MESSAGES: 'mq_messages',
  FAVORITES: 'mq_favorites',
  REPORTS: 'mq_reports',
  VERIFICATIONS: 'mq_verifications',
  NOTIFICATIONS: 'mq_notifications',
  SETTINGS: 'mq_settings'
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function initializeStore() {
  if (typeof window === 'undefined') return;

  const existingUsers = getStorage<UserProfile[]>(STORE_KEYS.USERS, []);
  if (!localStorage.getItem(STORE_KEYS.USERS) || existingUsers.length === 0) {
    setStorage(STORE_KEYS.USERS, INITIAL_USERS);
  } else {
    // Sync initial sample users if missing or outdated
    let usersUpdated = false;
    const userMap = new Map(existingUsers.map(u => [u.id, u]));

    INITIAL_USERS.forEach(iu => {
      const existing = userMap.get(iu.id);
      if (!existing) {
        userMap.set(iu.id, iu);
        usersUpdated = true;
      } else if (
        existing.name !== iu.name ||
        existing.phone !== iu.phone ||
        existing.whatsapp !== iu.whatsapp ||
        existing.bio !== iu.bio
      ) {
        userMap.set(iu.id, {
          ...existing,
          name: iu.name,
          phone: iu.phone,
          whatsapp: iu.whatsapp,
          bio: iu.bio
        });
        usersUpdated = true;
      }
    });

    if (usersUpdated) {
      setStorage(STORE_KEYS.USERS, Array.from(userMap.values()));
    }
  }

  if (localStorage.getItem(STORE_KEYS.CURRENT_USER_ID) === null) {
    setStorage(STORE_KEYS.CURRENT_USER_ID, '');
  } else {
    const currentUserId = getStorage<string>(STORE_KEYS.CURRENT_USER_ID, '');
    if (currentUserId === 'usr_delcio') {
      setStorage(STORE_KEYS.CURRENT_USER_ID, '');
    }
  }

  const existingAds = getStorage<Ad[]>(STORE_KEYS.ADS, []);
  if (!localStorage.getItem(STORE_KEYS.ADS) || existingAds.length === 0) {
    setStorage(STORE_KEYS.ADS, INITIAL_ADS);
  } else {
    // Sync demo ads to ensure new organized ads and realistic photos exist
    let adsUpdated = false;
    const adMap = new Map(existingAds.map(ad => [ad.id, ad]));

    ['ad_3', 'ad_4', 'ad_9', 'ad_10'].forEach(deletedId => {
      if (adMap.has(deletedId)) {
        adMap.delete(deletedId);
        adsUpdated = true;
      }
    });

    INITIAL_ADS.forEach(ia => {
      const existing = adMap.get(ia.id);
      if (!existing) {
        adMap.set(ia.id, ia);
        adsUpdated = true;
      } else if (
        existing.title !== ia.title ||
        existing.userId !== ia.userId ||
        existing.coverImage !== ia.coverImage ||
        existing.phone !== ia.phone ||
        existing.whatsapp !== ia.whatsapp
      ) {
        adMap.set(ia.id, {
          ...existing,
          title: ia.title,
          userId: ia.userId,
          coverImage: ia.coverImage,
          images: ia.images,
          description: ia.description,
          phone: ia.phone,
          whatsapp: ia.whatsapp,
          price: ia.price,
          bairro: ia.bairro,
          categoryName: ia.categoryName,
          categoryId: ia.categoryId,
          subcategory: ia.subcategory
        });
        adsUpdated = true;
      }
    });

    if (adsUpdated) {
      setStorage(STORE_KEYS.ADS, Array.from(adMap.values()));
    }
  }
  if (!localStorage.getItem(STORE_KEYS.CATEGORIES)) {
    setStorage(STORE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORE_KEYS.REVIEWS)) {
    setStorage(STORE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(STORE_KEYS.MESSAGES)) {
    setStorage(STORE_KEYS.MESSAGES, [
      {
        id: 'msg_1',
        adId: 'ad_1',
        adTitle: 'Eletricista Residencial e Comercial',
        senderId: 'usr_amina',
        senderName: 'Amina Mussa',
        receiverId: 'usr_delcio',
        receiverName: 'Délcio Langa',
        content: 'Olá Sr. Délcio, está disponível para fazer uma instalação amanhã no bairro Brandão?',
        read: false,
        createdAt: '2026-07-24T15:30:00Z'
      }
    ]);
  }
  if (!localStorage.getItem(STORE_KEYS.FAVORITES)) {
    setStorage(STORE_KEYS.FAVORITES, [
      { id: 'fav_1', userId: 'usr_delcio', adId: 'ad_2', createdAt: '2026-07-20T10:00:00Z' }
    ]);
  }
  if (!localStorage.getItem(STORE_KEYS.REPORTS)) {
    setStorage(STORE_KEYS.REPORTS, []);
  }
  if (!localStorage.getItem(STORE_KEYS.VERIFICATIONS)) {
    setStorage(STORE_KEYS.VERIFICATIONS, []);
  }
  if (!localStorage.getItem(STORE_KEYS.NOTIFICATIONS)) {
    setStorage(STORE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_1',
        userId: 'usr_delcio',
        title: 'Anúncio Aprovado!',
        message: 'O seu anúncio de Eletricista Residencial foi aprovado e já está público.',
        type: 'ad_approved',
        read: false,
        link: '/anuncio/ad_1',
        createdAt: '2026-07-24T08:00:00Z'
      }
    ]);
  }
  if (!localStorage.getItem(STORE_KEYS.SETTINGS)) {
    setStorage(STORE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
}

// User / Auth
export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const currentId = getStorage<string>(STORE_KEYS.CURRENT_USER_ID, '');
  if (!currentId) return null;
  const users = getStorage<UserProfile[]>(STORE_KEYS.USERS, INITIAL_USERS);
  return users.find(u => u.id === currentId) || null;
}

export function getAllUsers(): UserProfile[] {
  return getStorage<UserProfile[]>(STORE_KEYS.USERS, INITIAL_USERS);
}

export function setCurrentUser(userId: string): UserProfile | null {
  setStorage(STORE_KEYS.CURRENT_USER_ID, userId);
  if (!userId) return null;
  return getCurrentUser();
}

export function logoutUser(): void {
  setStorage(STORE_KEYS.CURRENT_USER_ID, '');
}

export function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  bairro: string;
  bio?: string;
  role?: UserRole;
}): UserProfile {
  const users = getAllUsers();
  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp || data.phone.replace(/[^0-9]/g, ''),
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300`,
    bairro: data.bairro || QUELIMANE_BAIRROS[0],
    city: 'Quelimane',
    bio: data.bio || 'Utilizador do Rent Market',
    role: data.role || 'user',
    plan: 'free',
    verificationStatus: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  setStorage(STORE_KEYS.USERS, users);
  setStorage(STORE_KEYS.CURRENT_USER_ID, newUser.id);
  return newUser;
}

export function loginOrRegisterGoogleUser(data: {
  email: string;
  name: string;
  avatarUrl?: string;
}): UserProfile {
  initializeStore();
  const users = getAllUsers();
  const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());

  if (existing) {
    if (data.avatarUrl && !existing.avatarUrl) {
      updateUserProfile(existing.id, { avatarUrl: data.avatarUrl });
    }
    setCurrentUser(existing.id);
    return existing;
  }

  const newUser: UserProfile = {
    id: `usr_google_${Date.now()}`,
    name: data.name || 'Utilizador Google',
    email: data.email,
    phone: '+258 84 000 0000',
    whatsapp: '840000000',
    avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    bairro: QUELIMANE_BAIRROS[0],
    city: 'Quelimane',
    bio: 'Conta iniciada via Google (Supabase)',
    role: 'user',
    plan: 'free',
    verificationStatus: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  setStorage(STORE_KEYS.USERS, users);
  setStorage(STORE_KEYS.CURRENT_USER_ID, newUser.id);
  return newUser;
}

export function syncUserFromSupabaseProfile(profile: any): UserProfile {
  initializeStore();
  const users = getAllUsers();
  const existingIndex = users.findIndex(
    u => u.id === profile.id || (profile.email && u.email.toLowerCase() === profile.email.toLowerCase())
  );

  const syncedUser: UserProfile = {
    id: profile.id,
    name: profile.name || (profile.email ? profile.email.split('@')[0] : 'Utilizador'),
    email: profile.email || '',
    phone: profile.phone || '',
    whatsapp: profile.whatsapp || profile.phone || '',
    avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || profile.id}`,
    bairro: profile.bairro || QUELIMANE_BAIRROS[0],
    city: profile.city || 'Quelimane',
    bio: profile.bio || '',
    role: (profile.role === 'admin' ? 'admin' : 'user') as UserRole,
    plan: profile.plan || 'free',
    verificationStatus: profile.verification_status || 'none',
    documentType: profile.document_type,
    documentNumber: profile.document_number,
    documentUrl: profile.document_url,
    isBanned: Boolean(profile.is_banned),
    banReason: profile.ban_reason || undefined,
    bannedAt: profile.banned_at || undefined,
    bannedBy: profile.banned_by || undefined,
    createdAt: profile.created_at || new Date().toISOString(),
    updatedAt: profile.updated_at || new Date().toISOString()
  };

  if (existingIndex !== -1) {
    users[existingIndex] = syncedUser;
  } else {
    users.push(syncedUser);
  }

  setStorage(STORE_KEYS.USERS, users);
  setStorage(STORE_KEYS.CURRENT_USER_ID, syncedUser.id);
  return syncedUser;
}

export function banUserStore(targetId: string, reason: string): boolean {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === targetId);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      isBanned: true,
      banReason: reason,
      bannedAt: new Date().toISOString()
    };
    setStorage(STORE_KEYS.USERS, users);

    // Reject active/pending ads of banned user
    const ads = getStorage<Ad[]>(STORE_KEYS.ADS, []);
    const updatedAds = ads.map(a => {
      if (a.userId === targetId && (a.status === 'active' || a.status === 'pending_approval')) {
        return { ...a, status: 'rejected' as AdStatus, rejectionReason: 'Conta suspensa/banida' };
      }
      return a;
    });
    setStorage(STORE_KEYS.ADS, updatedAds);
    return true;
  }
  return false;
}

export function unbanUserStore(targetId: string): boolean {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === targetId);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      isBanned: false,
      banReason: undefined,
      bannedAt: undefined
    };
    setStorage(STORE_KEYS.USERS, users);
    return true;
  }
  return false;
}

export function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  setStorage(STORE_KEYS.USERS, users);
  return users[index];
}

// Ads
export function getAds(options?: {
  categoryId?: string;
  subcategory?: string;
  bairro?: string;
  bairros?: string[];
  listingType?: string;
  searchQuery?: string;
  userId?: string;
  status?: AdStatus | 'all';
  featuredOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'popular';
}): Ad[] {
  let ads = getStorage<Ad[]>(STORE_KEYS.ADS, INITIAL_ADS);
  const users = getAllUsers();

  // Attach user object to ads
  ads = ads.map(ad => ({
    ...ad,
    user: users.find(u => u.id === ad.userId)
  }));

  if (options) {
    if (options.userId) {
      ads = ads.filter(ad => ad.userId === options.userId);
    }
    if (options.status && options.status !== 'all') {
      ads = ads.filter(ad => ad.status === options.status);
    } else if (!options.status) {
      // By default show active ads unless specified
      ads = ads.filter(ad => ad.status === 'active');
    }
    if (options.categoryId) {
      ads = ads.filter(ad => ad.categoryId === options.categoryId);
    }
    if (options.subcategory) {
      ads = ads.filter(ad => ad.subcategory === options.subcategory);
    }
    if (options.bairros && options.bairros.length > 0) {
      const allowedBairros = options.bairros.map(b => b.toLowerCase());
      ads = ads.filter(ad => allowedBairros.includes(ad.bairro.toLowerCase()));
    } else if (options.bairro) {
      ads = ads.filter(ad => ad.bairro.toLowerCase() === options.bairro?.toLowerCase());
    }
    if (options.listingType && options.listingType !== 'ambos') {
      ads = ads.filter(ad => ad.listingType === options.listingType);
    }
    if (options.featuredOnly) {
      let featuredList = ads.filter(ad => ad.isFeatured);
      // Fallback: If there are fewer than 4 explicitly featured ads, include popular/recent active ads
      if (featuredList.length < 4) {
        const remaining = ads.filter(ad => !ad.isFeatured);
        featuredList = [...featuredList, ...remaining];
      }
      ads = featuredList;
    }
    if (options.minPrice !== undefined && options.minPrice !== null && !isNaN(options.minPrice)) {
      ads = ads.filter(ad => (ad.price || 0) >= options.minPrice!);
    }
    if (options.maxPrice !== undefined && options.maxPrice !== null && !isNaN(options.maxPrice)) {
      ads = ads.filter(ad => (ad.price || 0) <= options.maxPrice!);
    }
    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase().trim();
      ads = ads.filter(ad => 
        ad.title.toLowerCase().includes(q) ||
        ad.description.toLowerCase().includes(q) ||
        ad.bairro.toLowerCase().includes(q) ||
        ad.subcategory.toLowerCase().includes(q) ||
        (ad.categoryName && ad.categoryName.toLowerCase().includes(q))
      );
    }

    if (options.sortBy) {
      if (options.sortBy === 'recent') {
        ads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (options.sortBy === 'price_asc') {
        ads.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (options.sortBy === 'price_desc') {
        ads.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (options.sortBy === 'popular') {
        ads.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      }
    } else if (options.featuredOnly) {
      // Sorting rules for featured ads:
      // 1. Newest uploads first (creation date within 14 days or recent)
      // 2. Otherwise ("Caso contrário"), sort by highest viewsCount (most views)
      const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      ads.sort((a, b) => {
        // Explicit featured flag priority first
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }

        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        const ageA = now - timeA;
        const ageB = now - timeB;

        const isANew = ageA <= FOURTEEN_DAYS_MS;
        const isBNew = ageB <= FOURTEEN_DAYS_MS;

        // 1. If one is recent and other is not, recent comes first
        if (isANew && !isBNew) return -1;
        if (!isANew && isBNew) return 1;

        // 2. If both are recent, sort by newest upload date
        if (isANew && isBNew) {
          if (timeB !== timeA) return timeB - timeA;
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }

        // 3. Otherwise ("Caso contrário"), sort by highest views count
        if ((b.viewsCount || 0) !== (a.viewsCount || 0)) {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }

        return timeB - timeA;
      });
    }
  }

  return ads;
}

export function getAdById(id: string): Ad | null {
  const ads = getAds({ status: 'all' });
  const ad = ads.find(a => a.id === id);
  if (ad) {
    // Increment view count
    incrementAdView(id);
  }
  return ad || null;
}

export function incrementAdView(id: string) {
  const ads = getStorage<Ad[]>(STORE_KEYS.ADS, INITIAL_ADS);
  const index = ads.findIndex(a => a.id === id);
  if (index !== -1) {
    ads[index].viewsCount += 1;
    setStorage(STORE_KEYS.ADS, ads);
  }
}

export function incrementAdContact(id: string) {
  const ads = getStorage<Ad[]>(STORE_KEYS.ADS, INITIAL_ADS);
  const index = ads.findIndex(a => a.id === id);
  if (index !== -1) {
    ads[index].contactsCount += 1;
    setStorage(STORE_KEYS.ADS, ads);
  }
}

export function createAd(data: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'contactsCount' | 'status' | 'expiresAt' | 'slug'>): Ad {
  const currentUser = getCurrentUser();
  const settings = getSettings();
  const ads = getStorage<Ad[]>(STORE_KEYS.ADS, INITIAL_ADS);

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + settings.adValidityDays);

  const autoApprove = settings.autoApproveAds || (currentUser?.plan === 'pro');

  const newAd: Ad = {
    ...data,
    id: `ad_${Date.now()}`,
    slug: data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    viewsCount: 0,
    contactsCount: 0,
    status: autoApprove ? 'active' : 'pending_approval',
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  ads.unshift(newAd);
  setStorage(STORE_KEYS.ADS, ads);

  // Send notification if pending
  if (!autoApprove && currentUser) {
    addNotification({
      userId: currentUser.id,
      title: 'Anúncio Submetido!',
      message: `O seu anúncio "${newAd.title}" foi enviado para moderação e ficará público em breve.`,
      type: 'verification',
      read: false,
      link: '/dashboard'
    });
  }

  return newAd;
}

export function updateAd(id: string, updates: Partial<Ad>): Ad | null {
  const ads = getStorage<Ad[]>(STORE_KEYS.ADS, INITIAL_ADS);
  const index = ads.findIndex(a => a.id === id);
  if (index === -1) return null;

  ads[index] = {
    ...ads[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  setStorage(STORE_KEYS.ADS, ads);
  return ads[index];
}

export function renewAd(id: string): Ad | null {
  const settings = getSettings();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + settings.adValidityDays);

  return updateAd(id, {
    expiresAt: expiresAt.toISOString(),
    status: 'active'
  });
}

export function boostAd(id: string, days: number = 30): Ad | null {
  const featuredUntil = new Date();
  featuredUntil.setDate(featuredUntil.getDate() + days);

  return updateAd(id, {
    isFeatured: true,
    featuredUntil: featuredUntil.toISOString()
  });
}

export function deleteAd(id: string): boolean {
  let ads = getStorage<Ad[]>(STORE_KEYS.ADS, INITIAL_ADS);
  const initialLength = ads.length;
  ads = ads.filter(a => a.id !== id);
  setStorage(STORE_KEYS.ADS, ads);
  return ads.length < initialLength;
}

// Categories
export function getCategories(): Category[] {
  return getStorage<Category[]>(STORE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export function addCategory(cat: Category): Category {
  const categories = getCategories();
  categories.push(cat);
  setStorage(STORE_KEYS.CATEGORIES, categories);
  return cat;
}

// Messages
export function getMessages(userId: string): Message[] {
  const messages = getStorage<Message[]>(STORE_KEYS.MESSAGES, []);
  return messages.filter(m => m.senderId === userId || m.receiverId === userId);
}

export function sendMessage(data: {
  adId: string;
  adTitle: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
}): Message {
  const messages = getStorage<Message[]>(STORE_KEYS.MESSAGES, []);
  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    ...data,
    read: false,
    createdAt: new Date().toISOString()
  };

  messages.push(newMsg);
  setStorage(STORE_KEYS.MESSAGES, messages);

  // Increment ad contacts count
  incrementAdContact(data.adId);

  // Send notification to receiver
  addNotification({
    userId: data.receiverId,
    title: `Nova mensagem de ${data.senderName}`,
    message: `Enviou uma mensagem sobre "${data.adTitle}": "${data.content.substring(0, 40)}..."`,
    type: 'message',
    read: false,
    link: '/dashboard?tab=messages'
  });

  return newMsg;
}

// Reviews
export function getUserReviews(userId: string): Review[] {
  const reviews = getStorage<Review[]>(STORE_KEYS.REVIEWS, INITIAL_REVIEWS);
  return reviews.filter(r => r.targetUserId === userId);
}

export function addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
  const reviews = getStorage<Review[]>(STORE_KEYS.REVIEWS, INITIAL_REVIEWS);
  const newRev: Review = {
    ...reviewData,
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newRev);
  setStorage(STORE_KEYS.REVIEWS, reviews);

  addNotification({
    userId: reviewData.targetUserId,
    title: 'Nova Avaliação Recebida!',
    message: `${reviewData.authorName} deixou uma avaliação de ${reviewData.rating} estrelas no seu perfil.`,
    type: 'review',
    read: false,
    link: `/perfil/${reviewData.targetUserId}`
  });

  return newRev;
}

// Favorites
export function getFavorites(userId: string): Ad[] {
  const favs = getStorage<Favorite[]>(STORE_KEYS.FAVORITES, []);
  const userFavAdIds = favs.filter(f => f.userId === userId).map(f => f.adId);
  const allAds = getAds({ status: 'all' });
  return allAds.filter(a => userFavAdIds.includes(a.id));
}

export function toggleFavorite(userId: string, adId: string): boolean {
  let favs = getStorage<Favorite[]>(STORE_KEYS.FAVORITES, []);
  const existing = favs.find(f => f.userId === userId && f.adId === adId);

  if (existing) {
    favs = favs.filter(f => !(f.userId === userId && f.adId === adId));
    setStorage(STORE_KEYS.FAVORITES, favs);
    return false; // Removed
  } else {
    favs.push({
      id: `fav_${Date.now()}`,
      userId,
      adId,
      createdAt: new Date().toISOString()
    });
    setStorage(STORE_KEYS.FAVORITES, favs);
    return true; // Added
  }
}

export function isFavorite(userId: string, adId: string): boolean {
  const favs = getStorage<Favorite[]>(STORE_KEYS.FAVORITES, []);
  return favs.some(f => f.userId === userId && f.adId === adId);
}

// Reports
export function submitReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
  const reports = getStorage<Report[]>(STORE_KEYS.REPORTS, []);
  const newReport: Report = {
    ...reportData,
    id: `rep_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  reports.unshift(newReport);
  setStorage(STORE_KEYS.REPORTS, reports);
  return newReport;
}

export function getReports(): Report[] {
  return getStorage<Report[]>(STORE_KEYS.REPORTS, []);
}

export function updateReportStatus(id: string, status: 'resolved' | 'dismissed'): boolean {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === id);
  if (index !== -1) {
    reports[index].status = status;
    setStorage(STORE_KEYS.REPORTS, reports);
    return true;
  }
  return false;
}

// Verification Requests
export function submitVerificationRequest(data: Omit<VerificationRequest, 'id' | 'createdAt' | 'status'>): VerificationRequest {
  const verifications = getStorage<VerificationRequest[]>(STORE_KEYS.VERIFICATIONS, []);
  const newReq: VerificationRequest = {
    ...data,
    id: `ver_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  verifications.unshift(newReq);
  setStorage(STORE_KEYS.VERIFICATIONS, verifications);

  // Update user status to pending
  updateUserProfile(data.userId, { verificationStatus: 'pending' });

  return newReq;
}

export function getVerificationRequests(): VerificationRequest[] {
  return getStorage<VerificationRequest[]>(STORE_KEYS.VERIFICATIONS, []);
}

export function resolveVerificationRequest(id: string, approved: boolean, reason?: string): boolean {
  const verifications = getVerificationRequests();
  const index = verifications.findIndex(v => v.id === id);
  if (index !== -1) {
    verifications[index].status = approved ? 'approved' : 'rejected';
    if (reason) verifications[index].rejectionReason = reason;
    setStorage(STORE_KEYS.VERIFICATIONS, verifications);

    const targetUserId = verifications[index].userId;
    updateUserProfile(targetUserId, { verificationStatus: approved ? 'verified' : 'rejected' });

    addNotification({
      userId: targetUserId,
      title: approved ? 'Selo de Verificado Concedido!' : 'Verificação Não Aprovada',
      message: approved 
        ? 'A sua identidade foi verificada pela nossa equipa! Agora exibe o selo de confiança.' 
        : `A sua solicitação de verificação foi recusada. Motivo: ${reason || 'Documento ilegível'}.`,
      type: 'verification',
      read: false,
      link: '/dashboard'
    });

    return true;
  }
  return false;
}

export function updateAdStatus(id: string, status: AdStatus): Ad | null {
  return updateAd(id, { status });
}

export function updateVerificationStatus(id: string, status: 'approved' | 'rejected', userId?: string): boolean {
  return resolveVerificationRequest(id, status === 'approved');
}

export function resolveReport(id: string): boolean {
  return updateReportStatus(id, 'resolved');
}

// Notifications
export function getNotifications(userId: string): Notification[] {
  const notifs = getStorage<Notification[]>(STORE_KEYS.NOTIFICATIONS, []);
  return notifs.filter(n => n.userId === userId);
}

export function addNotification(data: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const notifs = getStorage<Notification[]>(STORE_KEYS.NOTIFICATIONS, []);
  const newNotif: Notification = {
    ...data,
    id: `notif_${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  notifs.unshift(newNotif);
  setStorage(STORE_KEYS.NOTIFICATIONS, notifs);
  return newNotif;
}

export function markNotificationRead(id: string): void {
  const notifs = getStorage<Notification[]>(STORE_KEYS.NOTIFICATIONS, []);
  const index = notifs.findIndex(n => n.id === id);
  if (index !== -1) {
    notifs[index].read = true;
    setStorage(STORE_KEYS.NOTIFICATIONS, notifs);
  }
}

// Settings
export function getSettings(): SystemSettings {
  return getStorage<SystemSettings>(STORE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function updateSettings(updates: Partial<SystemSettings>): SystemSettings {
  const settings = getSettings();
  const updated = { ...settings, ...updates };
  setStorage(STORE_KEYS.SETTINGS, updated);
  return updated;
}
