import crypto from 'crypto';

const PAYSUITE_BASE_URL = process.env.PAYSUITE_API_BASE_URL?.trim() || 'https://paysuite.co.mz/api/v1';

export type PaySuiteMethod = 'mpesa' | 'emola' | 'credit_card';

function getApiToken(): string | null {
  return process.env.PAYSUITE_API_KEY?.trim() || process.env.PAYSUITE_API_TOKEN?.trim() || null;
}

export async function createPaySuitePaymentRequest(input: {
  amountMzn: number;
  reference: string;
  description: string;
  method: PaySuiteMethod;
  phoneNumber?: string;
  returnUrl?: string;
  callbackUrl?: string;
}) {
  const token = getApiToken();
  if (!token) {
    // If no API token configured, fallback to reference generation without throwing to allow development/testing
    return {
      id: `ps_ref_${Date.now()}`,
      reference: input.reference,
      status: 'pending',
      checkoutUrl: null,
    };
  }

  const res = await fetch(`${PAYSUITE_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: input.amountMzn.toFixed(2),
      reference: input.reference,
      description: input.description.slice(0, 125),
      method: input.method,
      phone_number: input.phoneNumber,
      ...(input.returnUrl ? { return_url: input.returnUrl } : {}),
      ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
    }),
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== 'success' || !json?.data?.id) {
    throw new Error(`PaySuite create payment falhou: ${json?.message || res.status}`);
  }

  return {
    id: String(json.data.id),
    reference: String(json.data.reference ?? input.reference),
    status: String(json.data.status ?? 'pending'),
    checkoutUrl: typeof json.data.checkout_url === 'string' ? json.data.checkout_url : null,
  };
}

export function verifyPaySuiteWebhookSignature(payload: string, signature: string | null): boolean {
  const secret = process.env.PAYSUITE_WEBHOOK_SECRET?.trim() || process.env.PAYMENT_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  // In development mode without signature provided, allow authorization if secret matches custom header
  if (!signature) {
    return false;
  }

  const normalized = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(normalized));
  } catch {
    return false;
  }
}

export function generatePaymentReference(type: string, userId: string): string {
  const clean = (v: string) => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `QM${clean(type).slice(0, 6)}${clean(userId).slice(0, 8)}${crypto.randomBytes(4).toString('hex').toUpperCase()}`.slice(0, 50);
}
