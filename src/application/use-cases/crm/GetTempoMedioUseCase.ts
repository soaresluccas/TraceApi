import type { ICrmRepository, TempoMedio } from '../../../domain/interfaces/index';

export class GetTempoMedioUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(): Promise<TempoMedio[]> {
    return this.crmRepository.getTempoMedio();
  }
}
