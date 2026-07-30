import { supabase, isSupabaseConfigured, isValidUuid } from '../supabase';
import { Ad } from '../types';
import { mapAdFromDb } from './ads';

export async function getFavoritesFromSupabase(userId: string): Promise<Ad[]> {
  if (!isSupabaseConfigured || !supabase || !userId || !isValidUuid(userId)) return [];

  try {
    const { data: favRows, error: favError } = await supabase
      .from('favorites')
      .select('ad_id')
      .eq('user_id', userId);

    if (favError || !favRows || favRows.length === 0) return [];

    const adIds = favRows.map(f => f.ad_id);

    const { data: adsRows, error: adsError } = await supabase
      .from('ads')
      .select('*, profiles(id, name, email, phone, whatsapp, avatar_url, bairro, city, bio, role, plan, verification_status)')
      .in('id', adIds);

    if (adsError || !adsRows) return [];

    return adsRows.map(mapAdFromDb);
  } catch (err) {
    console.error('Exceção getFavoritesFromSupabase:', err);
    return [];
  }
}

export async function toggleFavoriteInSupabase(userId: string, adId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId || !adId || !isValidUuid(userId) || !isValidUuid(adId)) return false;

  try {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('ad_id', adId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('ad_id', adId);
      return false; // Removed
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, ad_id: adId });
      return true; // Added
    }
  } catch (err) {
    console.error('Exceção toggleFavoriteInSupabase:', err);
    return false;
  }
}

export async function isFavoriteInSupabase(userId: string, adId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId || !adId || !isValidUuid(userId) || !isValidUuid(adId)) return false;

  try {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('ad_id', adId)
      .maybeSingle();

    return Boolean(data);
  } catch (err) {
    return false;
  }
}
