import type { ILeadRepository } from '../../domain/interfaces/index';

export class DeleteLeadUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.leadRepository.delete(id);
  }
}

