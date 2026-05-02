import type { Lead } from '../../domain/entities/index';
import type { ILeadRepository } from '../../domain/interfaces/index';

export class GetLeadByIdUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(id: string): Promise<Lead | null> {
    return this.leadRepository.findById(id);
  }
}

