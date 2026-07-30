import { supabase, isSupabaseConfigured, isValidUuid } from '../supabase';
import { Notification } from '../types';

export async function getNotificationsFromSupabase(userId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured || !supabase || !userId || !isValidUuid(userId)) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao pesquisar notificações no Supabase:', error.message);
      return [];
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type || 'system',
      read: Boolean(n.read),
      link: n.link || undefined,
      createdAt: n.created_at
    }));
  } catch (err) {
    console.error('Exceção getNotificationsFromSupabase:', err);
    return [];
  }
}

export async function addNotificationToSupabase(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(data.userId)) return null;

  try {
    const payload = {
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: data.read || false,
      link: data.link || null
    };

    const { data: row, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar notificação no Supabase:', error.message);
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      read: Boolean(row.read),
      link: row.link || undefined,
      createdAt: row.created_at
    };
  } catch (err) {
    console.error('Exceção addNotificationToSupabase:', err);
    return null;
  }
}

export async function markNotificationReadInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(id)) return false;

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Erro ao marcar notificação lida no Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exceção markNotificationReadInSupabase:', err);
    return false;
  }
}
