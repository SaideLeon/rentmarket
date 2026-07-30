import { supabase, isSupabaseConfigured, isValidUuid } from '../supabase';
import type { UserProfile } from '../types';

export async function getAllUsersFromSupabase(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao procurar utilizadores Supabase:', error);
    return [];
  }

  return (data || []).map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    whatsapp: u.whatsapp || u.phone || '',
    avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
    bairro: u.bairro || 'Centro da Cidade',
    city: u.city || 'Quelimane',
    bio: u.bio || '',
    role: u.role || 'user',
    plan: u.plan || 'free',
    verificationStatus: u.verification_status || 'none',
    documentType: u.document_type,
    documentNumber: u.document_number,
    documentUrl: u.document_url,
    isBanned: Boolean(u.is_banned),
    banReason: u.ban_reason || '',
    bannedAt: u.banned_at || '',
    bannedBy: u.banned_by || '',
    createdAt: u.created_at,
    updatedAt: u.updated_at
  }));
}

export async function banUserRPC(targetId: string, reason: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(targetId)) return false;
  try {
    const { error } = await supabase.rpc('admin_ban_user', {
      target_id: targetId,
      reason
    });
    if (error) {
      console.error('Erro RPC admin_ban_user:', error);
      // Fallback direct update if RPC is missing or restricted
      const { error: directErr } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          ban_reason: reason,
          banned_at: new Date().toISOString()
        })
        .eq('id', targetId);
      if (directErr) console.error('Erro update profiles ban:', directErr);
    }
    return true;
  } catch (err) {
    console.error('Exceção ao banir utilizador:', err);
    return false;
  }
}

export async function unbanUserRPC(targetId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(targetId)) return false;
  try {
    const { error } = await supabase.rpc('admin_unban_user', {
      target_id: targetId
    });
    if (error) {
      console.error('Erro RPC admin_unban_user:', error);
      const { error: directErr } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null
        })
        .eq('id', targetId);
      if (directErr) console.error('Erro update profiles unban:', directErr);
    }
    return true;
  } catch (err) {
    console.error('Exceção ao desbanir utilizador:', err);
    return false;
  }
}

export async function setUserRoleInSupabase(targetId: string, role: 'user' | 'admin'): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(targetId)) return false;
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', targetId);
  if (error) {
    console.error('Erro ao atualizar função do utilizador:', error);
    return false;
  }
  return true;
}
