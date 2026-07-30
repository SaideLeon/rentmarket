import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { syncPaymentStatusWithPaySuite } from '@/lib/payment-automation';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

async function getAuthenticatedUser(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && anonKey) {
      const supabase = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return user;
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const serviceClient = getServiceSupabase();
      if (serviceClient) {
        const { data: { user } } = await serviceClient.auth.getUser(token);
        if (user) return user;
      }
    }
  } catch (err) {
    console.warn('Aviso ao verificar autenticação para status:', err);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pagamento em falta.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Configuração do banco indisponível.' }, { status: 500 });
    }

    const authUser = await getAuthenticatedUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Não autenticado. Sessão inválida ou expirada.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('payments')
      .select('id, status, type, amount_mzn, created_at, confirmed_at, user_id')
      .eq('id', paymentId)
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Pagamento não encontrado ou não autorizado.' }, { status: 404 });
    }

    let currentData = data;
    // Active sync fallback with PaySuite if pending
    if (currentData.status === 'pending') {
      try {
        const synced = await syncPaymentStatusWithPaySuite(paymentId);
        if (synced && synced.status) {
          currentData.status = synced.status;
        }
      } catch (syncErr) {
        console.warn('Note: Polling sync fallback note:', syncErr);
      }
    }

    // Do not leak user_id in the response
    const { user_id, ...cleanData } = currentData;
    return NextResponse.json(cleanData);
  } catch (err: any) {
    console.error('Erro ao verificar estado do pagamento:', err);
    return NextResponse.json({ error: 'Erro ao consultar estado.' }, { status: 500 });
  }
}
