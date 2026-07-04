import type { ICrmRepository, FunnelMetrics } from '../../../domain/interfaces/index';

export class GetFunnelMetricsUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(): Promise<FunnelMetrics[]> {
    return this.crmRepository.getFunnelMetrics();
  }
}
