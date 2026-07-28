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
    const body = await req.json();
    const { userId, type, adId, method, phoneNumber } = body;

    if (!userId || !type || !method) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos. É necessário userId, type e method.' },
        { status: 400 }
      );
    }

    if ((method === 'mpesa' || method === 'emola') && !phoneNumber) {
      return NextResponse.json(
        { error: 'Número de telemóvel necessário para pagamentos M-Pesa/e-Mola.' },
        { status: 400 }
      );
    }

    // Official prices server-side
    const amountMzn = type === 'upgrade_plan' ? 500 : 250;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const gatewayRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const supabaseAdmin = getSupabaseAdmin();

    if (supabaseAdmin) {
      // Record pending payment in payments table
      const { error: dbErr } = await supabaseAdmin
        .from('payments')
        .insert({
          id: paymentId,
          user_id: userId,
          ad_id: adId || null,
          type,
          method,
          amount_mzn: amountMzn,
          status: 'pending',
          gateway_reference: gatewayRef
        });

      if (dbErr) {
        console.warn('Erro ao registar pagamento no Supabase:', dbErr.message);
      }
    }

    // Simulate calling mobile money API (e.g. PaySuite / M-Pesa API) asynchronously
    // In production, an external webhook notifies /api/payments/webhook
    return NextResponse.json({
      success: true,
      paymentId,
      gatewayReference: gatewayRef,
      amountMzn,
      status: 'pending',
      message: `Solicitação de débito ${method.toUpperCase()} enviada para o número ${phoneNumber || 'registado'}.`
    });
  } catch (err: any) {
    console.error('Erro ao iniciar pagamento:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar o pagamento.' },
      { status: 500 }
    );
  }
}
