export interface LeadControlMensalDTO {
  lead_id: string;
  lead_name: string;
  lead_instagram: string | null;
  lead_created_at: string;
  faturamento: string | null;
  cpl: string | null;
  mql: string | null;
  cpr: string | null;
  pct_conversao: string | null;
  investimento: string | null;
  roas: string | null;
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

export interface UpdateLeadControlMensalInput {
  faturamento?: string | null;
  cpl?: string | null;
  mql?: string | null;
  cpr?: string | null;
  pct_conversao?: string | null;
  investimento?: string | null;
  roas?: string | null;
}

export interface IMetricsRepository {
  getMonthlyMetrics(month: string): Promise<MonthlyMetricsDTO | null>;
  listLeadControlMensal(month: string): Promise<LeadControlMensalDTO[]>;
  updateLeadControlMensal(leadId: string, data: UpdateLeadControlMensalInput): Promise<LeadControlMensalDTO | null>;
}
