export interface MonthlyMetricsInput {
  totalInvestimento: number;
  totalFaturamento: number;
  totalLeads: number;
  qualificados: number;
  reunioesRealizadas: number;
  vendas: number;
}

export interface MonthlyMetricsResult {
  cpl: number | null;
  mql: number | null;
  cpr: number | null;
  pctConversao: number | null;
  roas: number | null;
}

export interface IMetricsCalculationService {
  calculate(input: MonthlyMetricsInput): MonthlyMetricsResult;
}
