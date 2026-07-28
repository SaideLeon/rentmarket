import { supabase, isSupabaseConfigured } from '../supabase';
import { UserProfile } from '../types';

export async function updateOwnProfileInSupabase(
  userId: string,
  updates: {
    name?: string;
    phone?: string;
    whatsapp?: string;
    bio?: string;
    avatarUrl?: string;
    bairro?: string;
    city?: string;
  }
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured || !supabase || !userId) return null;

  try {
    // Whitelist explicitly non-privileged fields
    const allowed: Record<string, any> = {};
    if (updates.name !== undefined) allowed.name = updates.name;
    if (updates.phone !== undefined) allowed.phone = updates.phone;
    if (updates.whatsapp !== undefined) allowed.whatsapp = updates.whatsapp;
    if (updates.bio !== undefined) allowed.bio = updates.bio;
    if (updates.avatarUrl !== undefined) allowed.avatar_url = updates.avatarUrl;
    if (updates.bairro !== undefined) allowed.bairro = updates.bairro;
    if (updates.city !== undefined) allowed.city = updates.city;

    const { data: row, error } = await supabase
      .from('profiles')
      .update(allowed)
      .eq('id', userId)
      .select()
      .single();

    if (error || !row) {
      console.error('Erro ao atualizar perfil no Supabase:', error?.message);
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      whatsapp: row.whatsapp || row.phone || '',
      avatarUrl: row.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`,
      bairro: row.bairro || 'Quelimane',
      city: row.city || 'Quelimane',
      bio: row.bio || '',
      role: row.role || 'user',
      plan: row.plan || 'free',
      verificationStatus: row.verification_status || 'none',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (err) {
    console.error('Exceção updateOwnProfileInSupabase:', err);
    return null;
  }
}
