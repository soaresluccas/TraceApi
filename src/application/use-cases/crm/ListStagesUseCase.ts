import type { ICrmRepository } from '../../../domain/interfaces/index';
import type { CrmStage } from '../../../domain/entities/index';

export class ListStagesUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(): Promise<CrmStage[]> {
    return this.crmRepository.listStages();
  }
}
