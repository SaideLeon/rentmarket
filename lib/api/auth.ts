import { supabase, isSupabaseConfigured } from '../supabase';

export async function getSupabaseProfileById(userId: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('Erro ao obter perfil no Supabase por ID:', userId, error?.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exceção ao procurar perfil no Supabase por ID:', err);
    return null;
  }
}
