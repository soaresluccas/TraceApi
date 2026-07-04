export interface ICrmStage {
  id: string;
  name: string;
  slug: string;
  position: number;
  color: string | null;
  is_closed: boolean;
  created_at: Date;
}

export class CrmStage implements ICrmStage {
  id: string;
  name: string;
  slug: string;
  position: number;
  color: string | null;
  is_closed: boolean;
  created_at: Date;

  private constructor(props: ICrmStage) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.position = props.position;
    this.color = props.color;
    this.is_closed = props.is_closed;
    this.created_at = new Date(props.created_at);
  }

  static fromDatabase(props: ICrmStage): CrmStage {
    return new CrmStage(props);
  }

  toPrimitive(): ICrmStage {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      position: this.position,
      color: this.color,
      is_closed: this.is_closed,
      created_at: this.created_at,
    };
  }
}
