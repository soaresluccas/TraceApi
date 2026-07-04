export interface ICrmStageHistory {
  id: string;
  card_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  changed_at: Date;
}

export class CrmStageHistory implements ICrmStageHistory {
  id: string;
  card_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  changed_at: Date;

  private constructor(props: ICrmStageHistory) {
    this.id = props.id;
    this.card_id = props.card_id;
    this.from_stage_id = props.from_stage_id;
    this.to_stage_id = props.to_stage_id;
    this.changed_at = new Date(props.changed_at);
  }

  static fromDatabase(props: ICrmStageHistory): CrmStageHistory {
    return new CrmStageHistory(props);
  }

  toPrimitive(): ICrmStageHistory {
    return {
      id: this.id,
      card_id: this.card_id,
      from_stage_id: this.from_stage_id,
      to_stage_id: this.to_stage_id,
      changed_at: this.changed_at,
    };
  }
}
