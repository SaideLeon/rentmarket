import { supabase, isSupabaseConfigured } from '../supabase';
import type { VerificationRequest } from '../types';

export async function uploadPrivateDocument(file: File, userId: string): Promise<{ path: string; error?: string }> {
  if (!file) return { path: '', error: 'Ficheiro não fornecido' };
  
  const fileExt = file.name ? file.name.split('.').pop() || 'png' : 'png';
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn('Erro ao carregar para o bucket privado "documentos", tentar fallback "anuncios":', error.message);
        // Fallback to anuncios if documentos bucket isn't created in Supabase project yet
        const { data: fallbackData, error: fallbackErr } = await supabase.storage
          .from('anuncios')
          .upload(`docs/${path}`, file, { cacheControl: '3600', upsert: true });
        
        if (!fallbackErr && fallbackData) {
          return { path: `anuncios/docs/${path}` };
        }
      } else if (data) {
        return { path };
      }
    } catch (err: any) {
      console.warn('Exceção no upload de documento privado:', err);
    }
  }

  return { path };
}

export async function getSignedDocumentUrl(imagePath: string): Promise<string> {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      if (imagePath.startsWith('anuncios/')) {
        const cleanPath = imagePath.replace('anuncios/', '');
        const { data } = supabase.storage.from('anuncios').getPublicUrl(cleanPath);
        if (data?.publicUrl) return data.publicUrl;
      }

      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUrl(imagePath, 300); // 5 minutes validity

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.warn('Erro ao gerar URL assinada para documento:', err);
    }
  }

  return imagePath;
}

export async function reviewVerificationRPC(
  requestId: string,
  approve: boolean,
  reason?: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.rpc('admin_review_verification', {
      request_id: requestId,
      approve,
      reason: reason || null
    });

    if (error) {
      console.error('Erro RPC admin_review_verification:', error);
      // Direct database fallback update if RPC is missing
      const statusStr = approve ? 'approved' : 'rejected';
      const verifStatusStr = approve ? 'verified' : 'rejected';

      const { data: verifReq } = await supabase
        .from('verification_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

      await supabase
        .from('verification_requests')
        .update({
          status: statusStr,
          rejection_reason: reason || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (verifReq?.user_id) {
        await supabase
          .from('profiles')
          .update({ verification_status: verifStatusStr })
          .eq('id', verifReq.user_id);
      }
    }

    return true;
  } catch (err) {
    console.error('Exceção ao rever pedido de verificação:', err);
    return false;
  }
}
