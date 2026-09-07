import type { Lead } from '../../domain/entities/index';
import type { ILeadRepository, LeadListFilters } from '../../domain/interfaces/index';

export interface ListLeadsInput {
  limit?: number;
  offset?: number;
  filters?: LeadListFilters;
}

export interface ListLeadsOutput {
  data: Lead[];
  total: number;
  limit: number;
  offset: number;
}

export class ListLeadsUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(input: ListLeadsInput): Promise<ListLeadsOutput> {
    const limit = input.limit || 10;
    const offset = input.offset || 0;

    const { data, total } = await this.leadRepository.findAll(limit, offset, input.filters);

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}

