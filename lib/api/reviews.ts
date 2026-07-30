import { supabase, isSupabaseConfigured, isValidUuid } from '../supabase';
import { Review } from '../types';

export async function getUserReviewsFromSupabase(userId: string): Promise<Review[]> {
  if (!isSupabaseConfigured || !supabase || !userId || !isValidUuid(userId)) return [];

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao pesquisar avaliações no Supabase:', error.message);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      targetUserId: r.target_user_id,
      authorId: r.author_id,
      authorName: r.author_name || 'Anónimo',
      authorAvatar: r.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.author_name}`,
      rating: Number(r.rating) || 5,
      comment: r.comment || '',
      createdAt: r.created_at
    }));
  } catch (err) {
    console.error('Exceção getUserReviewsFromSupabase:', err);
    return [];
  }
}

export async function addReviewToSupabase(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUuid(reviewData.targetUserId) || !isValidUuid(reviewData.authorId)) return null;

  try {
    const payload = {
      target_user_id: reviewData.targetUserId,
      author_id: reviewData.authorId,
      author_name: reviewData.authorName,
      author_avatar: reviewData.authorAvatar,
      rating: reviewData.rating,
      comment: reviewData.comment
    };

    const { data: row, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao submeter avaliação no Supabase:', error.message);
      return null;
    }

    return {
      id: row.id,
      targetUserId: row.target_user_id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorAvatar: row.author_avatar,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at
    };
  } catch (err) {
    console.error('Exceção addReviewToSupabase:', err);
    return null;
  }
}
