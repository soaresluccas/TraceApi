import { v4 as uuidv4 } from 'uuid';

export interface ILead {
  id: string;
  name: string;
  whatsapp: string;
  instagram?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  origem?: string | null;
  ad_origem?: string | null;
  curva_abc?: string | null;
  respondeu?: number | null;
  reuniao_agendada?: number | null;
  reuniao_concluida?: number | null;
  proposta_enviada?: number | null;
  conversao?: number | null;
  objecao?: number | null;
  created_at: Date;
  updated_at: Date;
}

export class Lead implements ILead {
  id: string;
  name: string;
  whatsapp: string;
  instagram?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  origem?: string | null;
  ad_origem?: string | null;
  curva_abc?: string | null;
  respondeu?: number | null;
  reuniao_agendada?: number | null;
  reuniao_concluida?: number | null;
  proposta_enviada?: number | null;
  conversao?: number | null;
  objecao?: number | null;
  created_at: Date;
  updated_at: Date;

  private constructor(props: Omit<ILead, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: Date; updated_at?: Date }) {
    this.id = props.id || uuidv4();
    this.name = props.name;
    this.whatsapp = props.whatsapp;
    this.instagram = props.instagram || null;
    this.utm_source = props.utm_source || null;
    this.utm_medium = props.utm_medium || null;
    this.utm_campaign = props.utm_campaign || null;
    this.utm_content = props.utm_content || null;
    this.utm_term = props.utm_term || null;
    this.origem = props.origem || null;
    this.ad_origem = props.ad_origem || null;
    this.curva_abc = props.curva_abc || null;
    this.respondeu = props.respondeu ?? null;
    this.reuniao_agendada = props.reuniao_agendada ?? null;
    this.reuniao_concluida = props.reuniao_concluida ?? null;
    this.proposta_enviada = props.proposta_enviada ?? null;
    this.conversao = props.conversao ?? null;
    this.objecao = props.objecao ?? null;
    this.created_at = props.created_at || new Date();
    this.updated_at = props.updated_at || new Date();
  }

  static create(props: Omit<ILead, 'id' | 'created_at' | 'updated_at'>): Lead {
    return new Lead(props);
  }

  static fromDatabase(props: ILead): Lead {
    return new Lead({
      ...props,
      created_at: new Date(props.created_at),
      updated_at: new Date(props.updated_at),
    });
  }

  update(props: Partial<Omit<ILead, 'id' | 'created_at'>>): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.whatsapp !== undefined) this.whatsapp = props.whatsapp;
    if (props.instagram !== undefined) this.instagram = props.instagram;
    if (props.utm_source !== undefined) this.utm_source = props.utm_source;
    if (props.utm_medium !== undefined) this.utm_medium = props.utm_medium;
    if (props.utm_campaign !== undefined) this.utm_campaign = props.utm_campaign;
    if (props.utm_content !== undefined) this.utm_content = props.utm_content;
    if (props.utm_term !== undefined) this.utm_term = props.utm_term;
    if (props.origem !== undefined) this.origem = props.origem;
    if (props.ad_origem !== undefined) this.ad_origem = props.ad_origem;
    if (props.curva_abc !== undefined) this.curva_abc = props.curva_abc;
    if (props.respondeu !== undefined) this.respondeu = props.respondeu;
    if (props.reuniao_agendada !== undefined) this.reuniao_agendada = props.reuniao_agendada;
    if (props.reuniao_concluida !== undefined) this.reuniao_concluida = props.reuniao_concluida;
    if (props.proposta_enviada !== undefined) this.proposta_enviada = props.proposta_enviada;
    if (props.conversao !== undefined) this.conversao = props.conversao;
    if (props.objecao !== undefined) this.objecao = props.objecao;
    this.updated_at = new Date();
  }

  toPrimitive(): ILead {
    return {
      id: this.id,
      name: this.name,
      whatsapp: this.whatsapp,
      instagram: this.instagram,
      utm_source: this.utm_source,
      utm_medium: this.utm_medium,
      utm_campaign: this.utm_campaign,
      utm_content: this.utm_content,
      utm_term: this.utm_term,
      origem: this.origem,
      ad_origem: this.ad_origem,
      curva_abc: this.curva_abc,
      respondeu: this.respondeu,
      reuniao_agendada: this.reuniao_agendada,
      reuniao_concluida: this.reuniao_concluida,
      proposta_enviada: this.proposta_enviada,
      conversao: this.conversao,
      objecao: this.objecao,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

