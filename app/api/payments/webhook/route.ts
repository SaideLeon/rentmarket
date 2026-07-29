import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyPaySuiteWebhookSignature } from '@/lib/paysuite';
import {
  confirmPaymentAutomaticallyByTransactionId,
  markPaymentAsRejectedByTransactionId,
  registerWebhookEventIfNew,
} from '@/lib/payment-automation';

export async function POST(req: NextRequest) {
  try {
    const rawPayload = await req.text();
    const signature =
      req.headers.get('x-webhook-signature') ||
      req.headers.get('x-paysuite-signature') ||
      '';
    const secretHeader =
      req.headers.get('x-webhook-secret') ||
      req.headers.get('authorization') ||
      '';
    const expectedSecret =
      process.env.PAYSUITE_WEBHOOK_SECRET?.trim() ||
      process.env.PAYMENT_WEBHOOK_SECRET?.trim();

    let isAuthorized = false;

    if (signature) {
      isAuthorized = verifyPaySuiteWebhookSignature(rawPayload, signature);
    } else if (expectedSecret && secretHeader.includes(expectedSecret)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      console.warn('Tentativa de chamada de webhook não autorizada.');
      return NextResponse.json(
        { error: 'Assinatura ou autenticação de webhook inválida.' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = JSON.parse(rawPayload);
    } catch {
      return NextResponse.json({ error: 'Payload JSON inválido.' }, { status: 400 });
    }

    const event = (body?.event || body?.type || 'payment.success').trim();
    const reference =
      body?.data?.reference ||
      body?.gatewayReference ||
      body?.reference ||
      body?.paymentId ||
      body?.id;
    const providerPaymentId = String(body?.data?.id || body?.id || reference || '');
    const requestId =
      String(body?.request_id || body?.id || '').trim() ||
      crypto.createHash('sha256').update(rawPayload).digest('hex');

    if (!reference) {
      return NextResponse.json({ error: 'Referência de pagamento não encontrada no payload.' }, { status: 400 });
    }

    // Idempotency check (Monere model)
    const webhookEvent = await registerWebhookEventIfNew({
      requestId,
      eventType: event,
      providerPaymentId: providerPaymentId || reference,
      payload: body,
    });

    if (webhookEvent.isDuplicate) {
      return NextResponse.json({ ok: true, duplicate: true, message: 'Evento já processado anteriormente.' });
    }

    const isSuccess =
      event === 'payment.success' ||
      body?.status === 'confirmed' ||
      body?.status === 'success' ||
      body?.status === 'paid' ||
      body?.data?.status === 'paid';

    if (isSuccess) {
      const result = await confirmPaymentAutomaticallyByTransactionId(
        reference,
        `Webhook PaySuite (${requestId})`
      );
      return NextResponse.json({ ok: true, result });
    } else {
      const result = await markPaymentAsRejectedByTransactionId(
        reference,
        `Webhook PaySuite falhou (${requestId})`
      );
      return NextResponse.json({ ok: true, result });
    }
  } catch (err: any) {
    console.error('Erro no webhook de pagamento:', err);
    return NextResponse.json({ error: 'Erro interno ao processar webhook.' }, { status: 500 });
  }
}
