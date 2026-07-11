import type { IMetricsCalculationService, MonthlyMetricsInput, MonthlyMetricsResult } from './IMetricsCalculationService';

export class MetricsCalculationService implements IMetricsCalculationService {
  calculate(input: MonthlyMetricsInput): MonthlyMetricsResult {
    const { totalInvestimento, totalFaturamento, totalLeads, qualificados, reunioesRealizadas, vendas } = input;

    const cpl = totalLeads > 0 ? Math.round((totalInvestimento / totalLeads) * 100) / 100 : null;
    const mql = totalLeads > 0 ? Math.round((qualificados / totalLeads) * 100 * 100) / 100 : null;
    const cpr = reunioesRealizadas > 0 ? Math.round((totalInvestimento / reunioesRealizadas) * 100) / 100 : null;
    const pctConversao = totalLeads > 0 ? Math.round((vendas / totalLeads) * 100 * 100) / 100 : null;
    const roas = totalInvestimento > 0 ? Math.round((totalFaturamento / totalInvestimento) * 100) / 100 : null;

    return { cpl, mql, cpr, pctConversao, roas };
  }
}
