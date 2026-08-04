import { REFERRAL_COOKIE_NAME } from './referral-constants';

/**
 * Retorna o ID do utilizador referente armazenado no cookie 'rm_ref_uid'.
 */
export function getReferralUserId(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + REFERRAL_COOKIE_NAME + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Reordena os anúncios colocando os do utilizador referente primeiro,
 * mantendo a ordem relativa original.
 */
export function prioritizeByReferral<T extends { userId?: string }>(ads: T[]): T[] {
  if (!ads || !Array.isArray(ads)) return ads;
  const refUserId = getReferralUserId();
  if (!refUserId) return ads;

  const userAds: T[] = [];
  const otherAds: T[] = [];

  for (const ad of ads) {
    if (ad && ad.userId === refUserId) {
      userAds.push(ad);
    } else {
      otherAds.push(ad);
    }
  }

  return [...userAds, ...otherAds];
}

/**
 * Constrói o link de partilha para um anúncio com o prefixo de indicação /r/<userId>?to=/anuncio/<adId>
 */
export function buildAdShareLink(userId: string | undefined, adId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (userId) {
    return `${origin}/r/${encodeURIComponent(userId)}?to=${encodeURIComponent(`/anuncio/${adId}`)}`;
  }
  return `${origin}/anuncio/${adId}`;
}

/**
 * Constrói o link de partilha para um perfil com o prefixo de indicação /r/<userId>?to=/perfil/<userId>
 */
export function buildProfileShareLink(userId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/r/${encodeURIComponent(userId)}?to=${encodeURIComponent(`/perfil/${userId}`)}`;
}
