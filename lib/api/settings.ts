import { supabase, isSupabaseConfigured } from '../supabase';
import { SystemSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';

export async function getSettingsFromSupabase(): Promise<SystemSettings> {
  if (!isSupabaseConfigured || !supabase) return INITIAL_SETTINGS;

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .maybeSingle();

    if (error || !data) {
      return INITIAL_SETTINGS;
    }

    return {
      freePlanMaxAds: Number(data.free_plan_max_ads) || INITIAL_SETTINGS.freePlanMaxAds,
      autoApproveAds: Boolean(data.auto_approve_ads),
      adValidityDays: Number(data.ad_validity_days) || INITIAL_SETTINGS.adValidityDays,
      featuredPriceMZN: Number(data.featured_price_mzn) || INITIAL_SETTINGS.featuredPriceMZN,
      proPlanPriceMonthlyMZN: Number(data.pro_plan_price_monthly_mzn) || INITIAL_SETTINGS.proPlanPriceMonthlyMZN,
      mpesaMerchantNumber: data.mpesa_merchant_number || INITIAL_SETTINGS.mpesaMerchantNumber,
      emolaMerchantNumber: data.emola_merchant_number || INITIAL_SETTINGS.emolaMerchantNumber
    };
  } catch (err) {
    console.error('Exceção getSettingsFromSupabase:', err);
    return INITIAL_SETTINGS;
  }
}

export async function updateSettingsInSupabase(updates: Partial<SystemSettings>): Promise<SystemSettings> {
  if (!isSupabaseConfigured || !supabase) return INITIAL_SETTINGS;

  try {
    const payload: Record<string, any> = {};
    if (updates.freePlanMaxAds !== undefined) payload.free_plan_max_ads = updates.freePlanMaxAds;
    if (updates.autoApproveAds !== undefined) payload.auto_approve_ads = updates.autoApproveAds;
    if (updates.adValidityDays !== undefined) payload.ad_validity_days = updates.adValidityDays;
    if (updates.featuredPriceMZN !== undefined) payload.featured_price_mzn = updates.featuredPriceMZN;
    if (updates.proPlanPriceMonthlyMZN !== undefined) payload.pro_plan_price_monthly_mzn = updates.proPlanPriceMonthlyMZN;
    if (updates.mpesaMerchantNumber !== undefined) payload.mpesa_merchant_number = updates.mpesaMerchantNumber;
    if (updates.emolaMerchantNumber !== undefined) payload.emola_merchant_number = updates.emolaMerchantNumber;

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({ id: 1, ...payload })
      .select()
      .single();

    if (error || !data) {
      console.error('Erro ao guardar definições no Supabase:', error?.message);
      return INITIAL_SETTINGS;
    }

    return {
      freePlanMaxAds: Number(data.free_plan_max_ads),
      autoApproveAds: Boolean(data.auto_approve_ads),
      adValidityDays: Number(data.ad_validity_days),
      featuredPriceMZN: Number(data.featured_price_mzn),
      proPlanPriceMonthlyMZN: Number(data.pro_plan_price_monthly_mzn),
      mpesaMerchantNumber: data.mpesa_merchant_number,
      emolaMerchantNumber: data.emola_merchant_number
    };
  } catch (err) {
    console.error('Exceção updateSettingsInSupabase:', err);
    return INITIAL_SETTINGS;
  }
}
