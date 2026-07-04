-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  instagram text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  origem text CHECK (origem IS NULL OR (origem = ANY (ARRAY['Anúncio'::text, 'Orgânico'::text, 'Indicação'::text, 'Manual'::text]))),
  ad_origem text,
  curva_abc text CHECK (curva_abc IS NULL OR (curva_abc = ANY (ARRAY['A'::text, 'B'::text, 'C'::text]))),
  respondeu integer,
  reuniao_agendada integer,
  reuniao_concluida integer,
  proposta_enviada integer,
  conversao integer,
  objecao integer,
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.metricas_diarias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  data date NOT NULL UNIQUE,
  leads integer NOT NULL DEFAULT 0,
  qualificados integer NOT NULL DEFAULT 0,
  conversas integer NOT NULL DEFAULT 0,
  reunioes_agendadas integer NOT NULL DEFAULT 0,
  reunioes_realizadas integer NOT NULL DEFAULT 0,
  propostas_enviadas integer NOT NULL DEFAULT 0,
  vendas integer NOT NULL DEFAULT 0,
  faturamento numeric NOT NULL DEFAULT 0,
  investimento numeric NOT NULL DEFAULT 0,
  cpl numeric DEFAULT 
CASE
    WHEN (leads > 0) THEN round((investimento / (leads)::numeric), 2)
    ELSE NULL::numeric
END,
  mql_pct numeric DEFAULT 
CASE
    WHEN (leads > 0) THEN round((((qualificados)::numeric / (leads)::numeric) * (100)::numeric), 2)
    ELSE NULL::numeric
END,
  cpr numeric DEFAULT 
CASE
    WHEN (reunioes_realizadas > 0) THEN round((investimento / (reunioes_realizadas)::numeric), 2)
    ELSE NULL::numeric
END,
  pct_conversao numeric DEFAULT 
CASE
    WHEN (leads > 0) THEN round((((vendas)::numeric / (leads)::numeric) * (100)::numeric), 2)
    ELSE NULL::numeric
END,
  roas numeric DEFAULT 
CASE
    WHEN (investimento > (0)::numeric) THEN round((faturamento / investimento), 2)
    ELSE NULL::numeric
END,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT metricas_diarias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.crm_stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  position integer NOT NULL,
  color text,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT crm_stages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.crm_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL UNIQUE,
  stage_id uuid NOT NULL,
  priority text CHECK (priority IS NULL OR (priority = ANY (ARRAY['Baixa'::text, 'Normal'::text, 'Alta'::text, 'Urgente'::text]))),
  position integer NOT NULL DEFAULT 0,
  assigned_to text,
  entered_stage_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT crm_cards_pkey PRIMARY KEY (id),
  CONSTRAINT crm_cards_lead_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id),
  CONSTRAINT crm_cards_stage_fkey FOREIGN KEY (stage_id) REFERENCES public.crm_stages(id)
);
CREATE TABLE public.crm_stage_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL,
  from_stage_id uuid,
  to_stage_id uuid NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT crm_stage_history_pkey PRIMARY KEY (id),
  CONSTRAINT crm_stage_history_card_fkey FOREIGN KEY (card_id) REFERENCES public.crm_cards(id),
  CONSTRAINT crm_stage_history_from_fkey FOREIGN KEY (from_stage_id) REFERENCES public.crm_stages(id),
  CONSTRAINT crm_stage_history_to_fkey FOREIGN KEY (to_stage_id) REFERENCES public.crm_stages(id)
);