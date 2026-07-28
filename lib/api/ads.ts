import { supabase, isSupabaseConfigured } from '../supabase';
import { Ad, AdStatus } from '../types';

export function mapAdFromDb(row: any): Ad {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    slug: row.slug || row.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    description: row.description || '',
    listingType: row.listing_type || 'venda',
    categoryId: row.category_id || '',
    categoryName: row.category_name || '',
    subcategory: row.subcategory || '',
    price: Number(row.price) || 0,
    priceType: row.price_type || 'fixo',
    bairro: row.bairro || 'Centro da Cidade',
    images: Array.isArray(row.images) ? row.images : [],
    coverImage: row.cover_image || (Array.isArray(row.images) && row.images[0]) || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || row.phone || '',
    status: (row.status || 'active') as AdStatus,
    isFeatured: Boolean(row.is_featured),
    featuredUntil: row.featured_until || undefined,
    viewsCount: Number(row.views_count) || 0,
    contactsCount: Number(row.contacts_count) || 0,
    expiresAt: row.expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    rejectionReason: row.rejection_reason || undefined,
    user: row.profiles
      ? {
          id: row.profiles.id,
          name: row.profiles.name || 'Utilizador',
          email: row.profiles.email || '',
          phone: row.profiles.phone || '',
          whatsapp: row.profiles.whatsapp || '',
          avatarUrl: row.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.profiles.name}`,
          bairro: row.profiles.bairro || 'Quelimane',
          city: row.profiles.city || 'Quelimane',
          bio: row.profiles.bio || '',
          role: row.profiles.role || 'user',
          plan: row.profiles.plan || 'free',
          verificationStatus: row.profiles.verification_status || 'none',
          createdAt: row.profiles.created_at || new Date().toISOString(),
          updatedAt: row.profiles.updated_at || new Date().toISOString()
        }
      : undefined
  };
}

export async function getAdsFromSupabase(options?: {
  categoryId?: string;
  subcategory?: string;
  bairro?: string;
  bairros?: string[];
  listingType?: string;
  searchQuery?: string;
  userId?: string;
  status?: AdStatus | 'all';
  featuredOnly?: boolean;
}): Promise<Ad[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    let query = supabase
      .from('ads')
      .select('*, profiles(id, name, email, phone, whatsapp, avatar_url, bairro, city, bio, role, plan, verification_status)')
      .order('created_at', { ascending: false });

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    } else if (!options?.status) {
      query = query.eq('status', 'active');
    }

    if (options?.categoryId) query = query.eq('category_id', options.categoryId);
    if (options?.subcategory) query = query.eq('subcategory', options.subcategory);
    if (options?.bairro) query = query.ilike('bairro', options.bairro);
    if (options?.listingType && options.listingType !== 'ambos') {
      query = query.eq('listing_type', options.listingType);
    }
    if (options?.featuredOnly) query = query.eq('is_featured', true);
    if (options?.searchQuery) {
      query = query.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%,bairro.ilike.%${options.searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao pesquisar anúncios do Supabase:', error.message);
      return [];
    }

    return (data || []).map(mapAdFromDb);
  } catch (err) {
    console.error('Exceção getAdsFromSupabase:', err);
    return [];
  }
}

export async function createAdInSupabase(
  adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'contactsCount' | 'status' | 'expiresAt' | 'slug'>,
  autoApprove: boolean = true
): Promise<Ad | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || adData.userId;

    const slug = adData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const payload = {
      user_id: userId,
      title: adData.title,
      slug,
      description: adData.description,
      listing_type: adData.listingType,
      category_id: adData.categoryId,
      category_name: adData.categoryName,
      subcategory: adData.subcategory,
      price: adData.price,
      price_type: adData.priceType,
      bairro: adData.bairro,
      images: adData.images || [],
      cover_image: adData.coverImage || (adData.images && adData.images[0]) || '',
      phone: adData.phone,
      whatsapp: adData.whatsapp,
      status: autoApprove ? 'active' : 'pending_approval'
    };

    const { data: row, error } = await supabase
      .from('ads')
      .insert(payload)
      .select('*, profiles(id, name, email, phone, whatsapp, avatar_url, bairro, city, bio, role, plan, verification_status)')
      .single();

    if (error) {
      console.error('Erro ao criar anúncio no Supabase:', error.message);
      return null;
    }

    return mapAdFromDb(row);
  } catch (err) {
    console.error('Exceção createAdInSupabase:', err);
    return null;
  }
}

export async function updateAdInSupabase(id: string, updates: Partial<Ad>): Promise<Ad | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const allowed: Record<string, any> = {};
    if (updates.title !== undefined) allowed.title = updates.title;
    if (updates.description !== undefined) allowed.description = updates.description;
    if (updates.price !== undefined) allowed.price = updates.price;
    if (updates.priceType !== undefined) allowed.price_type = updates.priceType;
    if (updates.images !== undefined) allowed.images = updates.images;
    if (updates.coverImage !== undefined) allowed.cover_image = updates.coverImage;
    if (updates.phone !== undefined) allowed.phone = updates.phone;
    if (updates.whatsapp !== undefined) allowed.whatsapp = updates.whatsapp;
    if (updates.bairro !== undefined) allowed.bairro = updates.bairro;
    if (updates.categoryId !== undefined) allowed.category_id = updates.categoryId;
    if (updates.categoryName !== undefined) allowed.category_name = updates.categoryName;
    if (updates.subcategory !== undefined) allowed.subcategory = updates.subcategory;

    const { data: row, error } = await supabase
      .from('ads')
      .update(allowed)
      .eq('id', id)
      .select('*, profiles(id, name, email, phone, whatsapp, avatar_url, bairro, city, bio, role, plan, verification_status)')
      .single();

    if (error) {
      console.error('Erro ao atualizar anúncio no Supabase:', error.message);
      return null;
    }

    return mapAdFromDb(row);
  } catch (err) {
    console.error('Exceção updateAdInSupabase:', err);
    return null;
  }
}

export async function deleteAdFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) {
      console.error('Erro ao eliminar anúncio no Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exceção deleteAdFromSupabase:', err);
    return false;
  }
}

export async function reviewAdRPC(adId: string, approve: boolean, reason?: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.rpc('admin_review_ad', {
      target_id: adId,
      approve,
      reason: reason || null
    });

    if (error) {
      console.warn('RPC admin_review_ad error, trying direct update fallback:', error.message);
      const { error: directErr } = await supabase
        .from('ads')
        .update({
          status: approve ? 'active' : 'rejected',
          rejection_reason: reason || null
        })
        .eq('id', adId);

      if (directErr) {
        console.error('Erro fallback ao rever anúncio:', directErr.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('Exceção reviewAdRPC:', err);
    return false;
  }
}

export async function boostAdRPC(adId: string, days: number = 30): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.rpc('boost_ad_paid', {
      target_id: adId,
      days
    });

    if (error) {
      console.warn('RPC boost_ad_paid error, trying direct update fallback:', error.message);
      const featuredUntil = new Date(Date.now() + days * 86400000).toISOString();
      const { error: directErr } = await supabase
        .from('ads')
        .update({
          is_featured: true,
          featured_until: featuredUntil
        })
        .eq('id', adId);

      if (directErr) {
        console.error('Erro fallback ao impulsionar anúncio:', directErr.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('Exceção boostAdRPC:', err);
    return false;
  }
}
