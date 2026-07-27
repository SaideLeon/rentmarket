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
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
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
        .createSignedUrl(imagePath, 3600); // 1 hour validity

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }

      // Try public fallback
      const { data: pubData } = supabase.storage.from('documentos').getPublicUrl(imagePath);
      if (pubData?.publicUrl) return pubData.publicUrl;
    } catch (err) {
      console.warn('Erro ao gerar URL assinada para documento:', err);
    }
  }

  return imagePath;
}

export async function getSignedDocumentUrls(imagePathOrPaths: string): Promise<{ title: string; url: string }[]> {
  if (!imagePathOrPaths) return [];
  const rawPaths = imagePathOrPaths.split(',').map(p => p.trim()).filter(Boolean);
  const items: { title: string; url: string }[] = [];

  for (let i = 0; i < rawPaths.length; i++) {
    const p = rawPaths[i];
    const url = await getSignedDocumentUrl(p);
    if (url) {
      let title = rawPaths.length > 1 ? (i === 0 ? 'Frente do Documento' : 'Verso do Documento') : 'Documento de Identificação';
      items.push({ title, url });
    }
  }

  return items;
}

export async function createVerificationRequestSupabase(params: {
  userId: string;
  documentType: 'bi' | 'nuit' | 'licenca';
  documentNumber: string;
  documentImagePath: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('verification_requests').insert({
      user_id: params.userId,
      document_type: params.documentType,
      document_number: params.documentNumber,
      document_image_path: params.documentImagePath,
      status: 'pending'
    });

    if (error) {
      console.error('Erro ao inserir pedido de verificação no Supabase:', error);
      return false;
    }

    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', params.userId);
    return true;
  } catch (err) {
    console.error('Exceção ao criar pedido de verificação no Supabase:', err);
    return false;
  }
}

export async function fetchVerificationRequestsSupabase(): Promise<VerificationRequest[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('verification_requests')
      .select(`
        id,
        user_id,
        document_type,
        document_number,
        document_image_path,
        status,
        rejection_reason,
        created_at,
        profiles (
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Erro ao carregar pedidos de verificação do Supabase:', error);
      return [];
    }

    return data.map((item: any) => {
      const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
      const paths = (item.document_image_path || '').split(',').map((p: string) => p.trim()).filter(Boolean);
      return {
        id: item.id,
        userId: item.user_id,
        userName: profile?.name || 'Utilizador',
        userPhone: profile?.phone || '',
        documentType: item.document_type as any,
        documentNumber: item.document_number,
        documentImageUrl: paths[0] || item.document_image_path || '',
        documentBackImageUrl: paths[1] || undefined,
        documentImagePath: item.document_image_path,
        status: item.status as any,
        rejectionReason: item.rejection_reason,
        createdAt: item.created_at
      };
    });
  } catch (err) {
    console.error('Exceção ao procurar pedidos de verificação no Supabase:', err);
    return [];
  }
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
