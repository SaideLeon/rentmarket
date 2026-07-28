import { supabase, isSupabaseConfigured } from '../supabase';
import { Report } from '../types';

export async function submitReportToSupabase(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const payload = {
      reporter_id: reportData.reporterId,
      reporter_name: reportData.reporterName || 'Utilizador',
      ad_id: reportData.adId || null,
      reported_user_id: reportData.reportedUserId || null,
      reason: reportData.reason,
      details: reportData.details || '',
      status: 'pending'
    };

    const { data: row, error } = await supabase
      .from('reports')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao submeter denúncia no Supabase:', error.message);
      return null;
    }

    return {
      id: row.id,
      reporterId: row.reporter_id,
      reporterName: row.reporter_name || 'Utilizador',
      adId: row.ad_id || undefined,
      reportedUserId: row.reported_user_id || undefined,
      reason: row.reason,
      details: row.details || '',
      status: row.status,
      createdAt: row.created_at
    };
  } catch (err) {
    console.error('Exceção submitReportToSupabase:', err);
    return null;
  }
}

export async function getReportsFromSupabase(): Promise<Report[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao pesquisar denúncias no Supabase:', error.message);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      reporterId: r.reporter_id,
      reporterName: r.reporter_name || 'Utilizador',
      adId: r.ad_id || undefined,
      reportedUserId: r.reported_user_id || undefined,
      reason: r.reason,
      details: r.details || r.description || '',
      status: r.status,
      createdAt: r.created_at
    }));
  } catch (err) {
    console.error('Exceção getReportsFromSupabase:', err);
    return [];
  }
}

export async function updateReportStatusInSupabase(id: string, status: 'resolved' | 'dismissed'): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar estado de denúncia no Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exceção updateReportStatusInSupabase:', err);
    return false;
  }
}
