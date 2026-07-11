import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IMetricsRepository,
  MonthlyControlDTO,
  MonthlyMetricsDTO,
  MonthlyMetricsCalculationResult,
  InvestimentoMensalDTO,
  UpsertInvestimentoMensalInput,
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

  async getMonthlyControl(month: string): Promise<MonthlyControlDTO | null> {
    const { data, error } = await this.supabase
      .from('lead_control_mensal')
      .select('*')
      .eq('mes', month)
      .maybeSingle();

    if (error) throw new Error(`Failed to get monthly control: ${error.message}`);
    if (!data) return null;

    return data as MonthlyControlDTO;
  }

  async recalculateMonthlyMetrics(month: string): Promise<MonthlyMetricsCalculationResult | null> {
    const { data, error } = await this.supabase
      .rpc('recalculate_monthly_metrics', { p_month: month });

    if (error) throw new Error(`Failed to recalculate monthly metrics: ${error.message}`);
    if (!data || data.length === 0) return null;

    return data[0] as MonthlyMetricsCalculationResult;
  }

  async getInvestimentoMensal(month: string): Promise<InvestimentoMensalDTO | null> {
    const { data, error } = await this.supabase
      .from('investimento_mensal')
      .select('*')
      .eq('mes', month)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`Failed to get investimento mensal: ${error.message}`);
    if (!data) return null;

    return data as InvestimentoMensalDTO;
  }

  async upsertInvestimentoMensal(input: UpsertInvestimentoMensalInput): Promise<InvestimentoMensalDTO | null> {
    const { data, error } = await this.supabase
      .from('investimento_mensal')
      .insert({ mes: input.mes, valor: input.valor })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to upsert investimento mensal: ${error.message}`);
    if (!data) return null;

    return data as InvestimentoMensalDTO;
  }
}
