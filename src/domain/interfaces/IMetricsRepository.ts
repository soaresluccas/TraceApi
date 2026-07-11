export interface MonthlyControlDTO {
  id: string;
  mes: string;
  cpl: number | null;
  mql: number | null;
  cpr: number | null;
  pct_conversao: number | null;
  roas: number | null;
  total_faturamento: number | null;
  total_investimento: number | null;
  total_leads: number | null;
  qualificados: number | null;
  reunioes_realizadas: number | null;
  vendas: number | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyMetricsDTO {
  data: string;
  leads: number;
  qualificados: number | null;
  conversas: number;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  propostas_enviadas: number;
  vendas: number;
}

export interface InvestimentoMensalDTO {
  id: string;
  mes: string;
  valor: number;
  created_at: string;
}

export interface UpsertInvestimentoMensalInput {
  mes: string;
  valor: number;
}

export interface MonthlyMetricsCalculationResult {
  total_leads: number;
  total_investimento: number;
  total_faturamento: number;
  qualificados: number;
  reunioes_realizadas: number;
  vendas: number;
  cpl: number | null;
  mql_pct: number | null;
  cpr: number | null;
  pct_conversao: number | null;
  roas: number | null;
}

export interface IMetricsRepository {
  getMonthlyMetrics(month: string): Promise<MonthlyMetricsDTO | null>;
  getMonthlyControl(month: string): Promise<MonthlyControlDTO | null>;
  recalculateMonthlyMetrics(month: string): Promise<MonthlyMetricsCalculationResult | null>;
  getInvestimentoMensal(month: string): Promise<InvestimentoMensalDTO | null>;
  upsertInvestimentoMensal(input: UpsertInvestimentoMensalInput): Promise<InvestimentoMensalDTO | null>;
}
