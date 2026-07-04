import type { SupabaseClient } from '@supabase/supabase-js';
import type { CrmStage, ICrmStage, CrmCard, ICrmCard } from '../../domain/entities/index';
import type {
  ICrmRepository,
  BoardStage,
  CardDetail,
  StageHistoryEntry,
  FunnelMetrics,
  TempoMedio,
  CreateCardInput,
  UpdateCardInput,
} from '../../domain/interfaces/index';
import { CrmStage as CrmStageEntity, CrmCard as CrmCardEntity } from '../../domain/entities/index';

export class CrmRepository implements ICrmRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listStages(): Promise<CrmStage[]> {
    const { data, error } = await this.supabase
      .from('crm_stages')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw new Error(`Failed to list stages: ${error.message}`);

    return (data || []).map((item) => CrmStageEntity.fromDatabase(item as ICrmStage));
  }

  async getBoard(): Promise<BoardStage[]> {
    const { data, error } = await this.supabase.rpc('get_board', {});

    if (error) throw new Error(`Failed to get board: ${error.message}`);
    if (!data) return [];

    return data as BoardStage[];
  }

  async createCard(input: CreateCardInput): Promise<CrmCard> {
    const { data, error } = await this.supabase.rpc('create_card', {
      p_lead_id: input.lead_id,
      p_stage_id: input.stage_id ?? null,
      p_priority: input.priority ?? null,
    });

    if (error) throw error;
    if (!data) throw new Error('Failed to create card: No data returned');

    return CrmCardEntity.fromDatabase(data as ICrmCard);
  }

  async moveCard(cardId: string, stageId: string, position?: number): Promise<CrmCard> {
    const { data, error } = await this.supabase.rpc('move_card', {
      p_card_id: cardId,
      p_to_stage_id: stageId,
      p_new_position: position ?? null,
    });

    if (error) throw error;
    if (!data) throw new Error('Failed to move card: No data returned');

    return CrmCardEntity.fromDatabase(data as ICrmCard);
  }

  async reorderCards(stageId: string, cardId: string, newPosition: number): Promise<CrmCard[]> {
    const { data, error } = await this.supabase.rpc('reorder_cards', {
      p_stage_id: stageId,
      p_card_id: cardId,
      p_new_position: newPosition,
    });

    if (error) throw error;
    if (!data) return [];

    return (data as ICrmCard[]).map((item) => CrmCardEntity.fromDatabase(item));
  }

  async updateCard(cardId: string, input: UpdateCardInput): Promise<CrmCard | null> {
    const { data, error } = await this.supabase.rpc('update_card', {
      p_card_id: cardId,
      p_priority: input.priority ?? null,
      p_assigned_to: input.assigned_to ?? null,
    });

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    if (!data) return null;

    return CrmCardEntity.fromDatabase(data as ICrmCard);
  }

  async getCardById(cardId: string): Promise<CardDetail | null> {
    const { data, error } = await this.supabase.rpc('get_card', {
      p_card_id: cardId,
    });

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    if (!data) return null;

    const card = data as any;
    return {
      id: card.id,
      lead_id: card.lead_id,
      stage_id: card.stage_id,
      priority: card.priority,
      position: card.position,
      assigned_to: card.assigned_to,
      entered_stage_at: new Date(card.entered_stage_at),
      closed_at: card.closed_at ? new Date(card.closed_at) : null,
      created_at: new Date(card.created_at),
      updated_at: new Date(card.updated_at),
      lead: card.lead,
    };
  }

  async getCardHistory(cardId: string): Promise<StageHistoryEntry[]> {
    const { data, error } = await this.supabase.rpc('get_card_history', {
      p_card_id: cardId,
    });

    if (error) throw error;
    if (!data) return [];

    return (data as any[]).map((item) => ({
      id: item.id,
      card_id: item.card_id,
      from_stage_id: item.from_stage_id,
      to_stage_id: item.to_stage_id,
      changed_at: new Date(item.changed_at),
      from_stage_name: item.from_stage_name ?? null,
      to_stage_name: item.to_stage_name ?? '',
    }));
  }

  async deleteCard(cardId: string): Promise<boolean> {
    const { error } = await this.supabase.rpc('delete_card', {
      p_card_id: cardId,
    });

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  }

  async getFunnelMetrics(): Promise<FunnelMetrics[]> {
    const { data, error } = await this.supabase
      .from('vw_crm_funil')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data as FunnelMetrics[];
  }

  async getTempoMedio(): Promise<TempoMedio[]> {
    const { data, error } = await this.supabase
      .from('vw_crm_tempo_medio_por_etapa')
      .select('*');

    if (error) throw error;
    if (!data) return [];

    return data as TempoMedio[];
  }
}
