import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function uploadProductImage(file: File): Promise<string> {
  if (!file) {
    throw new Error('Nenhum ficheiro fornecido.');
  }

  // 1. If Supabase is configured, attempt uploading to Supabase Storage
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name ? file.name.split('.').pop() || 'png' : 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `anuncios/${fileName}`;

      const { data, error } = await supabase.storage
        .from('anuncios')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('anuncios')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error or uncreated bucket, using local reader fallback:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase upload exception:', err);
    }
  }

  // 2. Fallback: Convert file directly to Data URL (base64) or Object URL seamlessly
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve(URL.createObjectURL(file));
        }
      };
      reader.onerror = () => {
        console.warn('FileReader erro, a utilizar URL.createObjectURL');
        try {
          resolve(URL.createObjectURL(file));
        } catch (e) {
          resolve('https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('FileReader exception, a utilizar URL.createObjectURL:', err);
      try {
        resolve(URL.createObjectURL(file));
      } catch (e) {
        resolve('https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800');
      }
    }
  });
}
