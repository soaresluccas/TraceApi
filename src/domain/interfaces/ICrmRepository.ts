import type { CrmStage, ICrmStage, CrmCard, ICrmCard, CrmStageHistory, ICrmStageHistory } from '../entities/index';

export interface BoardStage {
  id: string;
  name: string;
  slug: string;
  position: number;
  color: string | null;
  is_closed: boolean;
  cards: BoardCard[];
}

export interface BoardCard {
  id: string;
  lead_id: string;
  stage_id: string;
  priority: string | null;
  position: number;
  assigned_to: string | null;
  entered_stage_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  lead: {
    id: string;
    name: string;
    whatsapp: string;
    instagram: string | null;
    curva_abc: string | null;
  };
}

export interface CardDetail extends ICrmCard {
  lead: {
    id: string;
    name: string;
    whatsapp: string;
    instagram: string | null;
    curva_abc: string | null;
  };
}

export interface StageHistoryEntry extends ICrmStageHistory {
  from_stage_name: string | null;
  to_stage_name: string;
}

export interface FunnelMetrics {
  stage_id: string;
  etapa: string;
  position: number;
  total_leads: number;
}

export interface TempoMedio {
  to_stage_id: string;
  etapa: string;
  horas_media: number | null;
}

export interface CreateCardInput {
  lead_id: string;
  stage_id?: string;
  priority?: string;
}

export interface UpdateCardInput {
  priority?: string;
  assigned_to?: string;
}

export interface ICrmRepository {
  listStages(): Promise<CrmStage[]>;
  getBoard(): Promise<BoardStage[]>;
  createCard(input: CreateCardInput): Promise<CrmCard>;
  moveCard(cardId: string, stageId: string, position?: number): Promise<CrmCard>;
  reorderCards(stageId: string, cardId: string, newPosition: number): Promise<CrmCard[]>;
  updateCard(cardId: string, input: UpdateCardInput): Promise<CrmCard | null>;
  getCardById(cardId: string): Promise<CardDetail | null>;
  getCardHistory(cardId: string): Promise<StageHistoryEntry[]>;
  deleteCard(cardId: string): Promise<boolean>;
  getFunnelMetrics(): Promise<FunnelMetrics[]>;
  getTempoMedio(): Promise<TempoMedio[]>;
}
