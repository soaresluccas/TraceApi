import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IMetricsRepository,
  LeadControlMensalDTO,
  MonthlyMetricsDTO,
  UpdateLeadControlMensalInput,
} from '../../domain/interfaces/index';

export class MetricsRepository implements IMetricsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getMonthlyMetrics(month: string): Promise<MonthlyMetricsDTO | null> {
    const startDate = `${month}-01`;
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + 1);
    const endDate = end.toISOString().slice(0, 10);

    const { data, error } = await this.supabase
      .from('vw_metricas_mensais')
      .select('*')
      .gte('data', startDate)
      .lt('data', endDate)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get monthly metrics: ${error.message}`);
    }
    if (!data) return null;

    return data as MonthlyMetricsDTO;
  }

  async listLeadControlMensal(month: string): Promise<LeadControlMensalDTO[]> {
    const startDate = `${month}-01`;
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + 1);
    const endDate = end.toISOString().slice(0, 10);

    const { data, error } = await this.supabase
      .from('lead_control_mensal')
      .select(`
        lead_id,
        faturamento,
        cpl,
        mql,
        cpr,
        pct_conversao,
        investimento,
        roas,
        lead:leads (
          id,
          name,
          instagram,
          created_at
        )
      `)
      .gte('lead.created_at', startDate)
      .lt('lead.created_at', endDate)
      .order('lead.created_at', { ascending: false });

    if (error) throw new Error(`Failed to list lead control mensal: ${error.message}`);
    if (!data) return [];

    return (data as any[]).map((item) => ({
      lead_id: item.lead_id,
      lead_name: item.lead?.name ?? '',
      lead_instagram: item.lead?.instagram ?? null,
      lead_created_at: item.lead?.created_at ?? '',
      faturamento: item.faturamento,
      cpl: item.cpl,
      mql: item.mql,
      cpr: item.cpr,
      pct_conversao: item.pct_conversao,
      investimento: item.investimento,
      roas: item.roas,
    }));
  }

  async updateLeadControlMensal(leadId: string, data: UpdateLeadControlMensalInput): Promise<LeadControlMensalDTO | null> {
    const { data: updated, error } = await this.supabase
      .from('lead_control_mensal')
      .update(data)
      .eq('lead_id', leadId)
      .select(`
        lead_id,
        faturamento,
        cpl,
        mql,
        cpr,
        pct_conversao,
        investimento,
        roas,
        lead:leads (
          id,
          name,
          instagram,
          created_at
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to update lead control mensal: ${error.message}`);
    }
    if (!updated) return null;

    const item = updated as any;
    return {
      lead_id: item.lead_id,
      lead_name: item.lead?.name ?? '',
      lead_instagram: item.lead?.instagram ?? null,
      lead_created_at: item.lead?.created_at ?? '',
      faturamento: item.faturamento,
      cpl: item.cpl,
      mql: item.mql,
      cpr: item.cpr,
      pct_conversao: item.pct_conversao,
      investimento: item.investimento,
      roas: item.roas,
    };
  }
}
