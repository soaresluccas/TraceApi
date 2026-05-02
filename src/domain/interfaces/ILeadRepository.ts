import type { Lead, ILead } from '../entities/index';

export interface ILeadRepository {
  create(lead: Lead): Promise<Lead>;
  findById(id: string): Promise<Lead | null>;
  findAll(limit?: number, offset?: number): Promise<{ data: Lead[]; total: number }>;
  update(id: string, lead: Partial<ILead>): Promise<Lead | null>;
  delete(id: string): Promise<boolean>;
}

