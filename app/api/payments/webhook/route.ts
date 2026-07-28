import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('x-webhook-secret') || '';
    const expectedSecret = process.env.PAYSUITE_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || 'quelimercado_secret_webhook_key_2026';

    const body = await req.json();
    const { paymentId, status, secretToken } = body;

    // Validate webhook authorization / secret token to prevent unauthorized calls
    const isAuthorized = 
      authHeader.includes(expectedSecret) || 
      secretToken === expectedSecret ||
      (process.env.NODE_ENV === 'development' && secretToken === 'quelimercado_secret_webhook_key_2026');

    if (!isAuthorized) {
      console.warn('Tentativa de chamada de webhook não autorizada.');
      return NextResponse.json({ error: 'Assinatura ou chave de webhook inválida.' }, { status: 401 });
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pagamento em falta.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (supabaseAdmin) {
      // 1. Fetch payment details
      const { data: payment, error: fetchErr } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (fetchErr || !payment) {
        return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });
      }

      const finalStatus = status === 'failed' ? 'failed' : 'confirmed';

      // 2. Update status
      await supabaseAdmin
        .from('payments')
        .update({
          status: finalStatus,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      // 3. If confirmed, trigger server RPCs to grant features
      if (finalStatus === 'confirmed') {
        if (payment.type === 'upgrade_plan' && payment.user_id) {
          await supabaseAdmin.rpc('upgrade_plan_paid', {
            target_id: payment.user_id,
            new_plan: 'pro'
          });
        } else if (payment.type === 'boost_ad' && payment.ad_id) {
          await supabaseAdmin.rpc('boost_ad_paid', {
            target_id: payment.ad_id,
            days: 30
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook de pagamento autenticado e processado com sucesso.' });
  } catch (err: any) {
    console.error('Erro no webhook de pagamento:', err);
    return NextResponse.json({ error: 'Erro interno ao processar webhook.' }, { status: 500 });
  }
}
