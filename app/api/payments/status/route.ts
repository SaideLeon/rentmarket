import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
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

    const { data, error } = await supabase
      .from('payments')
      .select('id, status, type, amount_mzn, created_at, confirmed_at')
      .eq('id', paymentId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Erro ao verificar estado do pagamento:', err);
    return NextResponse.json({ error: 'Erro ao consultar estado.' }, { status: 500 });
  }
}
