import type { ILeadRepository, LeadNotInCrmDTO } from '../../domain/interfaces/index';

export interface ListLeadsNotInCrmInput {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListLeadsNotInCrmOutput {
  data: LeadNotInCrmDTO[];
  total: number;
  limit: number;
  offset: number;
}

export class ListLeadsNotInCrmUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(input: ListLeadsNotInCrmInput): Promise<ListLeadsNotInCrmOutput> {
    const limit = input.limit || 10;
    const offset = input.offset || 0;

    const { data, total } = await this.leadRepository.findAllNotInCrm(input.search, limit, offset);

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
