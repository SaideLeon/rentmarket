import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPaySuiteWebhookSignature } from '@/lib/paysuite';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    const rawPayload = await req.text();
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-paysuite-signature') || '';
    const secretHeader = req.headers.get('x-webhook-secret') || req.headers.get('authorization') || '';
    const expectedSecret = process.env.PAYSUITE_WEBHOOK_SECRET?.trim() || process.env.PAYMENT_WEBHOOK_SECRET?.trim();

    let isAuthorized = false;

    if (signature) {
      isAuthorized = verifyPaySuiteWebhookSignature(rawPayload, signature);
    } else if (expectedSecret && secretHeader.includes(expectedSecret)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      console.warn('Tentativa de chamada de webhook não autorizada.');
      return NextResponse.json({ error: 'Assinatura ou autenticação de webhook inválida.' }, { status: 401 });
    }

    const body = JSON.parse(rawPayload);
    const reference = body?.data?.reference || body?.gatewayReference || body?.reference;
    const paymentId = body?.paymentId || body?.id;
    const status = body?.event === 'payment.success' || body?.status === 'confirmed' || body?.status === 'success' ? 'confirmed' : 'failed';

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Configuração do banco de dados incompleta.' }, { status: 500 });
    }

    // Lookup payment by ID or gateway reference
    let targetPaymentId = paymentId;
    if (!targetPaymentId && reference) {
      const { data: found } = await supabase
        .from('payments')
        .select('id')
        .eq('gateway_reference', reference)
        .maybeSingle();
      if (found) targetPaymentId = found.id;
    }

    if (!targetPaymentId) {
      return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });
    }

    if (status === 'confirmed') {
      // Call atomic confirm_payment RPC
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('confirm_payment', {
        p_payment_id: targetPaymentId,
        p_confirmed_by: null,
        p_source: 'webhook',
      });

      if (rpcErr) {
        console.error('Erro na RPC confirm_payment:', rpcErr);
        // Fallback to table update + manual update if RPC fails
        const { data: pData } = await supabase.from('payments').select('*').eq('id', targetPaymentId).single();
        if (pData) {
          await supabase.from('payments').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', targetPaymentId);
          if (pData.type === 'upgrade_plan') {
            await supabase.from('profiles').update({ plan: 'pro' }).eq('id', pData.user_id);
          } else if (pData.type === 'boost_ad' && pData.ad_id) {
            await supabase.from('ads').update({ is_featured: true, featured_until: new Date(Date.now() + 30*24*60*60*1000).toISOString() }).eq('id', pData.ad_id);
          }
        }
      }
    } else {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', targetPaymentId);
    }

    return NextResponse.json({ ok: true, success: true, message: 'Webhook processado com sucesso.' });
  } catch (err: any) {
    console.error('Erro no webhook de pagamento:', err);
    return NextResponse.json({ error: 'Erro interno ao processar webhook.' }, { status: 500 });
  }
}

