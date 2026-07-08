import { z } from 'zod';
import type { IMetricsRepository, LeadControlMensalDTO, MonthlyMetricsDTO, UpdateLeadControlMensalInput } from '../../domain/interfaces/index';

export class GetMonthlyMetricsUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(month: string): Promise<MonthlyMetricsDTO | null> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('month deve estar no formato YYYY-MM');
    }
    return this.metricsRepository.getMonthlyMetrics(month);
  }
}

export class ListLeadControlMensalUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(month: string): Promise<LeadControlMensalDTO[]> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('month deve estar no formato YYYY-MM');
    }
    return this.metricsRepository.listLeadControlMensal(month);
  }
}

const UpdateLeadControlMensalSchema = z.object({
  faturamento: z.union([z.string(), z.null()]).optional(),
  cpl: z.union([z.string(), z.null()]).optional(),
  mql: z.union([z.string(), z.null()]).optional(),
  cpr: z.union([z.string(), z.null()]).optional(),
  pct_conversao: z.union([z.string(), z.null()]).optional(),
  investimento: z.union([z.string(), z.null()]).optional(),
  roas: z.union([z.string(), z.null()]).optional(),
});

export class UpdateLeadControlMensalUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(leadId: string, input: UpdateLeadControlMensalInput): Promise<LeadControlMensalDTO | null> {
    if (!leadId) throw new Error('leadId é obrigatório');
    const validated = UpdateLeadControlMensalSchema.parse(input);
    const hasFields = Object.keys(validated).length > 0;
    if (!hasFields) throw new Error('Nenhum campo fornecido');
    return this.metricsRepository.updateLeadControlMensal(leadId, validated);
  }
}
