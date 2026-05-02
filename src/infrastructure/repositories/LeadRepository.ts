import type { SupabaseClient } from '@supabase/supabase-js';
import type { Lead, ILead } from '../../domain/entities/index';
import type { ILeadRepository } from '../../domain/interfaces/index';
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
    const { data: countData, error: countError } = await this.supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(`Failed to count leads: ${countError.message}`);

    const { data, error } = await this.supabase
      .from('leads')
      .select()
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to list leads: ${error.message}`);

    const total = countData ? countData.length : 0;
    const leads = (data || []).map((item) => LeadEntity.fromDatabase(item as ILead));

    return { data: leads, total };
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

