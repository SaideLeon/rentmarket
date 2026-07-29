import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getPaySuitePaymentStatus, isPaySuitePaidStatus } from './paysuite';

function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function confirmPaymentAutomaticallyByPaymentId(
  paymentId: string,
  notes: string = 'Automação de servidor'
) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurado no servidor');

  // Call atomic confirm_payment RPC via service_role
  const { data, error } = await supabase.rpc('confirm_payment', {
    p_payment_id: paymentId,
    p_confirmed_by: null,
    p_source: 'webhook',
  });

  if (error) {
    // Fallback: direct atomic update if RPC fails
    const { data: pData } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('status', 'pending')
      .single();

    if (!pData) return { ok: true, alreadyProcessed: true };

    await supabase
      .from('payments')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (pData.type === 'upgrade_plan' && pData.user_id) {
      await supabase.from('profiles').update({ plan: 'pro' }).eq('id', pData.user_id);
    } else if (pData.type === 'boost_ad' && pData.ad_id) {
      await supabase
        .from('ads')
        .update({
          is_featured: true,
          featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', pData.ad_id);
    }

    return { ok: true, status: 'confirmed', type: pData.type };
  }

  return data;
}

export async function confirmPaymentAutomaticallyByTransactionId(
  transactionId: string,
  notes: string = 'Webhook PaySuite'
) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurado');

  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .or(`gateway_reference.eq.${transactionId},id.eq.${transactionId}`)
    .maybeSingle();

  if (!payment) {
    throw new Error(`Pagamento não encontrado para a referência: ${transactionId}`);
  }

  return confirmPaymentAutomaticallyByPaymentId(payment.id, notes);
}

export async function markPaymentAsRejectedByTransactionId(
  transactionId: string,
  notes: string = 'Rejeitado por falha no webhook'
) {
  const supabase = getServiceSupabase();
  if (!supabase) return { ok: false };

  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .or(`gateway_reference.eq.${transactionId},id.eq.${transactionId}`)
    .maybeSingle();

  if (!payment) return { ok: false, reason: 'not_found' };

  await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('id', payment.id)
    .eq('status', 'pending');

  return { ok: true, status: 'failed' };
}

export async function registerWebhookEventIfNew(input: {
  requestId: string;
  eventType: string;
  providerPaymentId: string;
  payload: any;
}) {
  const supabase = getServiceSupabase();
  if (!supabase) return { isDuplicate: false };

  const { error } = await supabase.from('payment_webhook_events').insert({
    request_id: input.requestId,
    event_type: input.eventType,
    provider_payment_id: input.providerPaymentId,
    payload: input.payload,
    processed_at: new Date().toISOString(),
  });

  if (error && (error.code === '23505' || error.message?.includes('unique'))) {
    return { isDuplicate: true };
  }

  return { isDuplicate: false };
}

export async function syncPaymentStatusWithPaySuite(paymentId: string) {
  const supabase = getServiceSupabase();
  if (!supabase) return null;

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();

  if (!payment || payment.status !== 'pending') {
    return payment;
  }

  const refToQuery = payment.gateway_reference || payment.id;
  const paySuiteInfo = await getPaySuitePaymentStatus(refToQuery);

  if (paySuiteInfo && isPaySuitePaidStatus(paySuiteInfo.status, paySuiteInfo.transactionStatus)) {
    await confirmPaymentAutomaticallyByPaymentId(payment.id, 'Sincronização manual por Polling');
    return { ...payment, status: 'confirmed' };
  }

  return payment;
}
