-- =========================================================================
-- MIGRATION: Controle de Leads + Métricas Mensais + CRM Kanban
-- Trace Company
-- =========================================================================
-- Baseado em:
--   1) Controle de Leads Individual 2026.xlsx  -> tabela leads (estendida)
--   2) Controle de Leads Mensal 2026.xlsx      -> tabela metricas_diarias
--   3) Print do ClickUp (funil de vendas)      -> crm_stages / crm_cards
-- =========================================================================

-- -------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR: atualizar updated_at automaticamente
-- -------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$ language plpgsql;


-- =========================================================================
-- 1) TABELA LEADS (estendida com colunas de controle da planilha Individual)
-- =========================================================================
-- Mantém: name, whatsapp, instagram, utm_source, utm_medium, utm_campaign,
--         utm_content, utm_term, created_at, updated_at
-- Adiciona: Origem, AD Origem, Curva ABC, Respondeu, Reunião Agendada,
--           Reunião Concluída, Proposta Enviada, Conversão, Objeção

alter table public.leads
  add column if not exists origem text null,
  add column if not exists ad_origem text null,          -- ex: AD01, AD09 (código do anúncio)
  add column if not exists curva_abc text null,           -- A / B / C (porte financeiro do lead)
  add column if not exists respondeu boolean not null default false,
  add column if not exists reuniao_agendada boolean not null default false,
  add column if not exists reuniao_concluida boolean not null default false,
  add column if not exists proposta_enviada boolean not null default false,
  add column if not exists conversao boolean not null default false,
  add column if not exists objecao text null;

-- Constraints de valores válidos (mesmos da aba "Legenda" da planilha)
alter table public.leads
  drop constraint if exists leads_origem_check;
alter table public.leads
  add constraint leads_origem_check
  check (origem is null or origem in ('Anúncio', 'Orgânico', 'Indicação', 'Manual'));

alter table public.leads
  drop constraint if exists leads_curva_abc_check;
alter table public.leads
  add constraint leads_curva_abc_check
  check (curva_abc is null or curva_abc in ('A', 'B', 'C'));

create index if not exists leads_origem_idx on public.leads using btree (origem);
create index if not exists leads_curva_abc_idx on public.leads using btree (curva_abc);
create index if not exists leads_conversao_idx on public.leads using btree (conversao);

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();


-- =========================================================================
-- 2) TABELA METRICAS_DIARIAS (equivalente ao "Controle de Leads Mensal")
-- =========================================================================
-- Uma linha por dia. Os campos que a planilha calculava via fórmula
-- (CPL, MQL, CPR, % Conversão, ROAS) viram colunas geradas automaticamente.
-- Investimento e Faturamento continuam manuais (vêm do gestor de tráfego /
-- financeiro), o resto pode ser preenchido manualmente ou populado por
-- rotina a partir da tabela leads/crm_cards (veja a view no final).

create table public.metricas_diarias (
  id uuid not null default gen_random_uuid(),
  data date not null,
  leads integer not null default 0,
  qualificados integer not null default 0,
  conversas integer not null default 0,
  reunioes_agendadas integer not null default 0,
  reunioes_realizadas integer not null default 0,
  propostas_enviadas integer not null default 0,
  vendas integer not null default 0,
  faturamento numeric(12, 2) not null default 0,
  investimento numeric(12, 2) not null default 0,

  -- colunas calculadas (equivalentes às fórmulas da planilha)
  cpl numeric(12, 2) generated always as (
    case when leads > 0 then round(investimento / leads, 2) else null end
  ) stored,
  mql_pct numeric(6, 2) generated always as (
    case when leads > 0 then round((qualificados::numeric / leads) * 100, 2) else null end
  ) stored,
  cpr numeric(12, 2) generated always as (
    case when reunioes_realizadas > 0 then round(investimento / reunioes_realizadas, 2) else null end
  ) stored,
  pct_conversao numeric(6, 2) generated always as (
    case when leads > 0 then round((vendas::numeric / leads) * 100, 2) else null end
  ) stored,
  roas numeric(8, 2) generated always as (
    case when investimento > 0 then round(faturamento / investimento, 2) else null end
  ) stored,

  created_at timestamp with time zone not null default current_timestamp,
  updated_at timestamp with time zone not null default current_timestamp,
  constraint metricas_diarias_pkey primary key (id),
  constraint metricas_diarias_data_unique unique (data)
) tablespace pg_default;

create index if not exists metricas_diarias_data_idx on public.metricas_diarias using btree (data desc);

drop trigger if exists trg_metricas_diarias_updated_at on public.metricas_diarias;
create trigger trg_metricas_diarias_updated_at
before update on public.metricas_diarias
for each row execute function public.set_updated_at();

-- View auxiliar: métricas do dia calculadas automaticamente a partir dos
-- leads e cards do CRM (útil pra conferir/preencher metricas_diarias sem
-- depender só de digitação manual). Investimento/Faturamento continuam
-- de fora pois não existem nessas tabelas.
create or replace view public.vw_metricas_diarias_calculadas as
select
  date(l.created_at) as data,
  count(*) as leads,
  count(*) filter (where l.curva_abc is not null) as qualificados,
  count(*) filter (where l.respondeu) as conversas,
  count(*) filter (where l.reuniao_agendada) as reunioes_agendadas,
  count(*) filter (where l.reuniao_concluida) as reunioes_realizadas,
  count(*) filter (where l.proposta_enviada) as propostas_enviadas,
  count(*) filter (where l.conversao) as vendas
from public.leads l
group by date(l.created_at);


-- =========================================================================
-- 3) CRM KANBAN (fases do print do ClickUp)
-- =========================================================================

-- 3.1) Fases do funil (lookup, ordenável)
create table public.crm_stages (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null,
  position integer not null,
  color text null,
  is_closed boolean not null default false, -- true para fases terminais (Perdida/Ganho)
  created_at timestamp with time zone not null default current_timestamp,
  constraint crm_stages_pkey primary key (id),
  constraint crm_stages_slug_unique unique (slug)
) tablespace pg_default;

insert into public.crm_stages (name, slug, position, color, is_closed) values
  ('Qualificar',              'qualificar',            1, '#6b7280', false),
  ('Em Contato',              'em_contato',            2, '#10b981', false),
  ('FW1 - Sem Resposta',      'fw1_sem_resposta',      3, '#eab308', false),
  ('Reunião Agendada',        'reuniao_agendada',      4, '#3b82f6', false),
  ('Reunião Concluída',       'reuniao_concluida',     5, '#06b6d4', false),
  ('FW2 - Não Compareceu',    'fw2_nao_compareceu',    6, '#f97316', false),
  ('Proposta Enviada',        'proposta_enviada',      7, '#8b5cf6', false),
  ('FW3 - Não Tomou Decisão', 'fw3_nao_tomou_decisao', 8, '#f59e0b', false),
  ('Outro Momento',           'outro_momento',         9, '#ef4444', false),
  ('Perdida',                 'perdida',              10, '#dc2626', true),
  ('Ganho',                   'ganho',                11, '#22c55e', true)
on conflict (slug) do nothing;

-- 3.2) Cards do kanban (1 card ativo por lead, é o que aparece no board)
create table public.crm_cards (
  id uuid not null default gen_random_uuid(),
  lead_id uuid not null,
  stage_id uuid not null,
  priority text null,               -- Baixa / Normal / Alta / Urgente (visto no print)
  position integer not null default 0, -- ordem do card dentro da coluna
  assigned_to text null,            -- responsável pelo card (opcional)
  entered_stage_at timestamp with time zone not null default current_timestamp,
  closed_at timestamp with time zone null,
  created_at timestamp with time zone not null default current_timestamp,
  updated_at timestamp with time zone not null default current_timestamp,
  constraint crm_cards_pkey primary key (id),
  constraint crm_cards_lead_fkey foreign key (lead_id) references public.leads (id) on delete cascade,
  constraint crm_cards_stage_fkey foreign key (stage_id) references public.crm_stages (id),
  constraint crm_cards_lead_unique unique (lead_id), -- um lead tem só um card ativo no funil
  constraint crm_cards_priority_check check (priority is null or priority in ('Baixa', 'Normal', 'Alta', 'Urgente'))
) tablespace pg_default;

create index if not exists crm_cards_lead_idx on public.crm_cards using btree (lead_id);
create index if not exists crm_cards_stage_idx on public.crm_cards using btree (stage_id);

-- 3.3) Histórico de movimentação entre fases (dá métricas de tempo por etapa,
-- taxa de conversão por fase, etc.)
create table public.crm_stage_history (
  id uuid not null default gen_random_uuid(),
  card_id uuid not null,
  from_stage_id uuid null,
  to_stage_id uuid not null,
  changed_at timestamp with time zone not null default current_timestamp,
  constraint crm_stage_history_pkey primary key (id),
  constraint crm_stage_history_card_fkey foreign key (card_id) references public.crm_cards (id) on delete cascade,
  constraint crm_stage_history_from_fkey foreign key (from_stage_id) references public.crm_stages (id),
  constraint crm_stage_history_to_fkey foreign key (to_stage_id) references public.crm_stages (id)
) tablespace pg_default;

create index if not exists crm_stage_history_card_idx on public.crm_stage_history using btree (card_id);

-- 3.4) Trigger: registra automaticamente no histórico toda vez que o card
-- é criado ou muda de fase, e marca closed_at quando entra em fase terminal
create or replace function public.log_crm_stage_change_before()
returns trigger as $$
begin
  if (tg_op = 'UPDATE' and old.stage_id is distinct from new.stage_id) then
    new.entered_stage_at = current_timestamp;

    if exists (
      select 1 from public.crm_stages s
      where s.id = new.stage_id and s.is_closed
    ) then
      new.closed_at = current_timestamp;
    else
      new.closed_at = null;
    end if;
  end if;

  new.updated_at = current_timestamp;
  return new;
end;
$$ language plpgsql;

create or replace function public.log_crm_stage_change_after()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.crm_stage_history (card_id, from_stage_id, to_stage_id)
    values (new.id, null, new.stage_id);

  elsif (tg_op = 'UPDATE' and old.stage_id is distinct from new.stage_id) then
    insert into public.crm_stage_history (card_id, from_stage_id, to_stage_id)
    values (new.id, old.stage_id, new.stage_id);
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_crm_cards_stage_change on public.crm_cards;
drop trigger if exists trg_crm_cards_before on public.crm_cards;
drop trigger if exists trg_crm_cards_after on public.crm_cards;
create trigger trg_crm_cards_before
before insert or update on public.crm_cards
for each row execute function public.log_crm_stage_change_before();
create trigger trg_crm_cards_after
after insert or update on public.crm_cards
for each row execute function public.log_crm_stage_change_after();

-- 3.5) Views prontas pra dashboard do funil

-- Quantos leads em cada coluna do kanban agora (igual ao número no print)
create or replace view public.vw_crm_funil as
select
  s.id as stage_id,
  s.name as etapa,
  s.position,
  count(c.id) as total_leads
from public.crm_stages s
left join public.crm_cards c on c.stage_id = s.id
group by s.id, s.name, s.position
order by s.position;

-- Tempo médio (em horas) que os cards ficam em cada fase
create or replace view public.vw_crm_tempo_medio_por_etapa as
select
  h.to_stage_id,
  s.name as etapa,
  avg(
    extract(epoch from (coalesce(h2.changed_at, current_timestamp) - h.changed_at)) / 3600
  ) as horas_media
from public.crm_stage_history h
join public.crm_stages s on s.id = h.to_stage_id
left join lateral (
  select changed_at
  from public.crm_stage_history h2
  where h2.card_id = h.card_id and h2.changed_at > h.changed_at
  order by h2.changed_at asc
  limit 1
) h2 on true
group by h.to_stage_id, s.name;
