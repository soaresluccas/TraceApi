import { z } from 'zod';
import type { IMetricsRepository, MonthlyMetricsDTO, MonthlyControlDTO, MonthlyMetricsCalculationResult, InvestimentoMensalDTO, UpsertInvestimentoMensalInput } from '../../domain/interfaces/index';
import { parseBRCurrency } from '../../domain/utils/index';

export class GetMonthlyMetricsUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(month: string): Promise<MonthlyMetricsDTO | null> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('month deve estar no formato YYYY-MM');
    }
    return this.metricsRepository.getMonthlyMetrics(month);
  }
}

export class GetMonthlyControlUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(month: string): Promise<MonthlyControlDTO | null> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('month deve estar no formato YYYY-MM');
    }
    return this.metricsRepository.getMonthlyControl(month);
  }
}

export class RecalculateMonthlyMetricsUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(month: string): Promise<MonthlyMetricsCalculationResult | null> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('month deve estar no formato YYYY-MM');
    }
    return this.metricsRepository.recalculateMonthlyMetrics(month);
  }
}

const UpsertInvestimentoMensalSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/),
  valor: z.union([z.string(), z.number()]),
});

export class UpsertInvestimentoMensalUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(input: UpsertInvestimentoMensalInput): Promise<InvestimentoMensalDTO | null> {
    const validated = UpsertInvestimentoMensalSchema.parse(input);
    const valor = parseBRCurrency(validated.valor);
    if (valor === null) throw new Error('valor inválido');
    return this.metricsRepository.upsertInvestimentoMensal({ mes: validated.mes, valor });
  }
}

export class GetInvestimentoMensalUseCase {
  constructor(private readonly metricsRepository: IMetricsRepository) {}

  async execute(month: string): Promise<InvestimentoMensalDTO | null> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('month deve estar no formato YYYY-MM');
    }
    return this.metricsRepository.getInvestimentoMensal(month);
  }
}
