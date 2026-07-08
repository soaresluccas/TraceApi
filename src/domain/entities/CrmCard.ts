export interface ICrmCard {
  id: string;
  lead_id: string;
  stage_id: string;
  priority: string | null;
  position: number;
  assigned_to: string | null;
  observacao: string | null;
  entered_stage_at: Date;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class CrmCard implements ICrmCard {
  id: string;
  lead_id: string;
  stage_id: string;
  priority: string | null;
  position: number;
  assigned_to: string | null;
  observacao: string | null;
  entered_stage_at: Date;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;

  private constructor(props: ICrmCard) {
    this.id = props.id;
    this.lead_id = props.lead_id;
    this.stage_id = props.stage_id;
    this.priority = props.priority;
    this.position = props.position;
    this.assigned_to = props.assigned_to;
    this.observacao = props.observacao;
    this.entered_stage_at = new Date(props.entered_stage_at);
    this.closed_at = props.closed_at ? new Date(props.closed_at) : null;
    this.created_at = new Date(props.created_at);
    this.updated_at = new Date(props.updated_at);
  }

  static fromDatabase(props: ICrmCard): CrmCard {
    return new CrmCard(props);
  }

  toPrimitive(): ICrmCard {
    return {
      id: this.id,
      lead_id: this.lead_id,
      stage_id: this.stage_id,
      priority: this.priority,
      position: this.position,
      assigned_to: this.assigned_to,
      observacao: this.observacao,
      entered_stage_at: this.entered_stage_at,
      closed_at: this.closed_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
