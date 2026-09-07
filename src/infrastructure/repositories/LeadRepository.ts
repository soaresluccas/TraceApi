import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead, ILead } from '../../domain/entities/index';
import type { ILeadRepository, LeadControlDTO, LeadNotInCrmDTO, LeadListFilters } from '../../domain/interfaces/index';
import { Lead as LeadEntity } from '../../domain/entities/index';

function monthRange(month: string): { start: string; end: string } {
  const start = `${month}-01`;
  const endDate = new Date(`${month}-01T00:00:00Z`);
  endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

function applyFilters<T extends { eq: Function; gte: Function; lt: Function; or: Function }>(
  query: T,
  filters: LeadListFilters
): T {
  let next = query;
  if (filters.utm_source) next = next.eq('utm_source', filters.utm_source);
  if (filters.utm_medium) next = next.eq('utm_medium', filters.utm_medium);
  if (filters.utm_campaign) next = next.eq('utm_campaign', filters.utm_campaign);
  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, (c: string) => `\\${c}`);
    next = next.or(`name.ilike.%${term}%,whatsapp.ilike.%${term}%`);
  }
  if (filters.month) {
    const { start, end } = monthRange(filters.month);
    next = next.gte('created_at', start).lt('created_at', end);
  }
  return next;
}

export class LeadRepository implements ILeadRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(lead: Lead): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .insert(lead.toPrimitive())
      .select()
      .single();

    if (error) throw new Error(`Failed to create lead: ${error.message}`);
    if (!data) throw new Error('Failed to create lead: No data returned');

    return LeadEntity.fromDatabase(data as ILead);
  }

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to find lead: ${error.message}`);
    if (!data) return null;

    return LeadEntity.fromDatabase(data as ILead);
  }

  async findAll(limit: number = 10, offset: number = 0, filters: LeadListFilters = {}): Promise<{ data: Lead[]; total: number }> {
    const baseCount = this.supabase.from('leads').select('*', { count: 'exact', head: true });
    const countQuery = applyFilters(baseCount, filters);

    const baseData = this.supabase
      .from('leads')
      .select()
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    const dataQuery = applyFilters(baseData, filters);

    const { count, error: countError } = await countQuery;
    if (countError) throw new Error(`Failed to count leads: ${countError.message}`);

    const { data, error } = await dataQuery;
    if (error) throw new Error(`Failed to list leads: ${error.message}`);

    const total = count ?? 0;
    const leads = (data || []).map((item) => LeadEntity.fromDatabase(item as ILead));

    return { data: leads, total };
  }

  async findAllControl(limit: number = 10, offset: number = 0, month?: string): Promise<{ data: LeadControlDTO[]; total: number }> {
    let countQuery = this.supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    let dataQuery = this.supabase
      .from('leads')
      .select('id, name, instagram, faturamento, curva_abc, respondeu, reuniao_agendada, reuniao_concluida, proposta_enviada, conversao, objecao')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (month) {
      const startDate = `${month}-01`;
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + 1);
      const endDate = end.toISOString().slice(0, 10);
      countQuery = countQuery.gte('created_at', startDate).lt('created_at', endDate);
      dataQuery = dataQuery.gte('created_at', startDate).lt('created_at', endDate);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw new Error(`Failed to count leads: ${countError.message}`);

    const { data, error } = await dataQuery;

    if (error) throw new Error(`Failed to list leads control: ${error.message}`);

    const total = count ?? 0;
    const leads = (data || []) as LeadControlDTO[];

    return { data: leads, total };
  }

  async findAllNotInCrm(search?: string, limit: number = 10, offset: number = 0): Promise<{ data: LeadNotInCrmDTO[]; total: number }> {
    const { data, error } = await this.supabase.rpc('get_leads_not_in_crm', {
      p_search: search ?? null,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw new Error(`Failed to list leads not in CRM: ${error.message}`);
    if (!data) return { data: [], total: 0 };

    const result = data as { data: LeadNotInCrmDTO[]; total: number };
    return { data: result.data, total: result.total };
  }

  async update(id: string, leadData: Partial<ILead>): Promise<Lead | null> {
    const lead = await this.findById(id);
    if (!lead) return null;

    const { data, error } = await this.supabase
      .from('leads')
      .update(leadData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update lead: ${error.message}`);
    if (!data) throw new Error('Failed to update lead: No data returned');

    return LeadEntity.fromDatabase(data as ILead);
  }

  async updateControl(id: string, data: Partial<Omit<LeadControlDTO, 'id' | 'name' | 'instagram'>>): Promise<LeadControlDTO | null> {
    const { data: updated, error } = await this.supabase
      .from('leads')
      .update(data)
      .eq('id', id)
      .select('id, name, instagram, faturamento, curva_abc, respondeu, reuniao_agendada, reuniao_concluida, proposta_enviada, conversao, objecao')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to update lead control: ${error.message}`);
    }
    if (!updated) return null;

    return updated as LeadControlDTO;
  }

  async delete(id: string): Promise<boolean> {
    const lead = await this.findById(id);
    if (!lead) return false;

    const { error } = await this.supabase.from('leads').delete().eq('id', id);

    if (error) throw new Error(`Failed to delete lead: ${error.message}`);
    return true;
  }
}

