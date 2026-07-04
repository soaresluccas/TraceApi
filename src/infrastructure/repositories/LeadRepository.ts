import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead, ILead } from '../../domain/entities/index';
import type { ILeadRepository, LeadControlDTO, LeadNotInCrmDTO } from '../../domain/interfaces/index';
import { Lead as LeadEntity } from '../../domain/entities/index';

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

  async findAll(limit: number = 10, offset: number = 0): Promise<{ data: Lead[]; total: number }> {
    const { count, error: countError } = await this.supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(`Failed to count leads: ${countError.message}`);

    const { data, error } = await this.supabase
      .from('leads')
      .select()
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to list leads: ${error.message}`);

    const total = count ?? 0;
    const leads = (data || []).map((item) => LeadEntity.fromDatabase(item as ILead));

    return { data: leads, total };
  }

  async findAllControl(limit: number = 10, offset: number = 0): Promise<{ data: LeadControlDTO[]; total: number }> {
    const { count, error: countError } = await this.supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(`Failed to count leads: ${countError.message}`);

    const { data, error } = await this.supabase
      .from('leads')
      .select('id, name, instagram, curva_abc, respondeu, reuniao_agendada, reuniao_concluida, proposta_enviada, conversao, objecao')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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

  async delete(id: string): Promise<boolean> {
    const lead = await this.findById(id);
    if (!lead) return false;

    const { error } = await this.supabase.from('leads').delete().eq('id', id);

    if (error) throw new Error(`Failed to delete lead: ${error.message}`);
    return true;
  }
}

