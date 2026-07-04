import type { LeadControlDTO } from '../../domain/interfaces/index';
import type { ILeadRepository } from '../../domain/interfaces/index';

export interface ListLeadsControlInput {
  limit?: number;
  offset?: number;
}

export interface ListLeadsControlOutput {
  data: LeadControlDTO[];
  total: number;
  limit: number;
  offset: number;
}

export class ListLeadsControlUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(input: ListLeadsControlInput): Promise<ListLeadsControlOutput> {
    const limit = input.limit || 10;
    const offset = input.offset || 0;

    const { data, total } = await this.leadRepository.findAllControl(limit, offset);

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
