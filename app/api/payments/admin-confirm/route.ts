import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    let adminUser = null;
    if (supabaseUrl && anonKey) {
      const supabase = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      adminUser = user;
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const serviceSupabase = getServiceSupabase();
    if (!serviceSupabase) {
      return NextResponse.json({ error: 'Configuração do banco indisponível no servidor.' }, { status: 500 });
    }

    // Check if user is admin in profiles
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
    }

    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pagamento em falta.' }, { status: 400 });
    }

    // Call confirm_payment via service_role with source='admin'
    const { data, error } = await serviceSupabase.rpc('confirm_payment', {
      p_payment_id: paymentId,
      p_confirmed_by: adminUser.id,
      p_source: 'admin',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Erro na confirmação de pagamento por admin:', err);
    return NextResponse.json({ error: 'Erro interno ao processar confirmação manual.' }, { status: 500 });
  }
}
