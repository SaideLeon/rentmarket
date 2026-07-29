import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPaySuitePaymentRequest, generatePaymentReference, PaySuiteMethod } from '@/lib/paysuite';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

const PRICES: Record<string, number> = {
  upgrade_plan: 500,
  boost_ad: 250,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, adId, method, phoneNumber } = body;

    if (!userId || !type || !method) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos. É necessário userId, type e method.' },
        { status: 400 }
      );
    }

    if (!['upgrade_plan', 'boost_ad'].includes(type) || !['mpesa', 'emola', 'credit_card', 'stripe'].includes(method)) {
      return NextResponse.json({ error: 'Tipo ou método de pagamento não suportado.' }, { status: 400 });
    }

    if ((method === 'mpesa' || method === 'emola') && !phoneNumber?.trim()) {
      return NextResponse.json(
        { error: 'Número de telemóvel necessário para pagamentos M-Pesa / e-Mola.' },
        { status: 400 }
      );
    }

    const amountMzn = PRICES[type] || 250;
    const reference = generatePaymentReference(type, userId);
    const appUrl = process.env.APP_URL?.trim() || new URL(req.url).origin;

    let paySuitePayment = null;
    try {
      paySuitePayment = await createPaySuitePaymentRequest({
        amountMzn,
        reference,
        description: `QueliMercado - ${type === 'upgrade_plan' ? 'Plano Pro' : 'Anúncio em Destaque'}`,
        method: method as PaySuiteMethod,
        phoneNumber,
        callbackUrl: `${appUrl}/api/payments/webhook`,
      });
    } catch (paySuiteErr: any) {
      console.warn('PaySuite payment creation note:', paySuiteErr?.message || paySuiteErr);
    }

    const gatewayRef = paySuitePayment?.reference || reference;
    const supabase = getServiceSupabase();
    let paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (supabase) {
      // Try using register_payment RPC or direct service role insert
      const { data: rpcData, error: rpcErr } = await supabase.rpc('register_payment', {
        p_user_id: userId,
        p_type: type,
        p_ad_id: adId || null,
        p_method: method,
        p_amount_mzn: amountMzn,
        p_gateway_reference: gatewayRef,
      });

      if (!rpcErr && rpcData?.payment_id) {
        paymentId = rpcData.payment_id;
      } else {
        // Fallback to table insert if RPC not present in current DB state
        const { error: dbErr } = await supabase.from('payments').insert({
          id: paymentId,
          user_id: userId,
          ad_id: adId || null,
          type,
          method,
          amount_mzn: amountMzn,
          status: 'pending',
          gateway_reference: gatewayRef,
        });

        if (dbErr) {
          console.warn('Erro ao registar pagamento no Supabase:', dbErr.message);
        }
      }
    }

    // Secure response: NEVER return secrets or client auto-confirm parameters
    return NextResponse.json({
      success: true,
      paymentId,
      gatewayReference: gatewayRef,
      amountMzn,
      status: 'pending',
      checkoutUrl: paySuitePayment?.checkoutUrl || null,
      message: `Solicitação de pagamento (${method.toUpperCase()}) enviada. Por favor confirme no seu dispositivo.`,
    });
  } catch (err: any) {
    console.error('Erro ao iniciar pagamento:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar a solicitação de pagamento.' },
      { status: 500 }
    );
  }
}

