import { supabase, isSupabaseConfigured } from '../supabase';
import { Message } from '../types';

export async function getMessagesFromSupabase(userId: string): Promise<Message[]> {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao pesquisar mensagens no Supabase:', error.message);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      adId: m.ad_id || '',
      adTitle: m.ad_title || '',
      senderId: m.sender_id,
      senderName: m.sender_name || 'Utilizador',
      receiverId: m.receiver_id,
      receiverName: m.receiver_name || 'Utilizador',
      content: m.content,
      read: Boolean(m.read),
      createdAt: m.created_at
    }));
  } catch (err) {
    console.error('Exceção getMessagesFromSupabase:', err);
    return [];
  }
}

export async function sendMessageToSupabase(data: {
  adId: string;
  adTitle: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
}): Promise<Message | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const payload = {
      ad_id: data.adId,
      ad_title: data.adTitle,
      sender_id: data.senderId,
      sender_name: data.senderName,
      receiver_id: data.receiverId,
      receiver_name: data.receiverName,
      content: data.content,
      read: false
    };

    const { data: row, error } = await supabase
      .from('messages')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao enviar mensagem no Supabase:', error.message);
      return null;
    }

    return {
      id: row.id,
      adId: row.ad_id,
      adTitle: row.ad_title,
      senderId: row.sender_id,
      senderName: row.sender_name,
      receiverId: row.receiver_id,
      receiverName: row.receiver_name,
      content: row.content,
      read: Boolean(row.read),
      createdAt: row.created_at
    };
  } catch (err) {
    console.error('Exceção sendMessageToSupabase:', err);
    return null;
  }
}
