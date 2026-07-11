import type { Lead, ILead } from '../entities/index';

export interface ILeadRepository {
  create(lead: Lead): Promise<Lead>;
  findById(id: string): Promise<Lead | null>;
  findAll(limit?: number, offset?: number, utm_source?: string): Promise<{ data: Lead[]; total: number }>;
  findAllControl(limit?: number, offset?: number): Promise<{ data: LeadControlDTO[]; total: number }>;
  findAllNotInCrm(search?: string, limit?: number, offset?: number): Promise<{ data: LeadNotInCrmDTO[]; total: number }>;
  update(id: string, lead: Partial<ILead>): Promise<Lead | null>;
  updateControl(id: string, data: Partial<Omit<LeadControlDTO, 'id' | 'name' | 'instagram'>>): Promise<LeadControlDTO | null>;
  delete(id: string): Promise<boolean>;
}

export interface LeadControlDTO {
  id: string;
  name: string;
  instagram: string | null;
  faturamento: number | null;
  curva_abc: number | null;
  respondeu: number | null;
  reuniao_agendada: number | null;
  reuniao_concluida: number | null;
  proposta_enviada: number | null;
  conversao: number | null;
  objecao: string | null;
}

export interface LeadNotInCrmDTO {
  id: string;
  name: string;
  whatsapp: string;
  instagram: string | null;
}

