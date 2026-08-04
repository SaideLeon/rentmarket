import { NextRequest, NextResponse } from 'next/server';
import { REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE } from '../../../lib/referral-constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const to = searchParams.get('to') || '/';

  // Garantir que o destino 'to' é um caminho relativo para evitar redirecionamentos externos inseguros
  const redirectTarget = to.startsWith('/') ? to : '/';
  const redirectUrl = new URL(redirectTarget, request.url);

  const response = NextResponse.redirect(redirectUrl);

  if (userId) {
    response.cookies.set({
      name: REFERRAL_COOKIE_NAME,
      value: userId,
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
  }

  return response;
}
