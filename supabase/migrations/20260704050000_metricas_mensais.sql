-- =========================================================================
-- MIGRATION: Controle Mensal de Métricas
-- =========================================================================

-- 1) Tabela lead_control_mensal: uma linha por lead com campos manuais
create table if not exists public.lead_control_mensal (
  id uuid not null default gen_random_uuid(),
  lead_id uuid not null,
  faturamento text null,
  cpl text null,
  mql text null,
  cpr text null,
  pct_conversao text null,
  investimento text null,
  roas text null,
  created_at timestamp with time zone not null default current_timestamp,
  updated_at timestamp with time zone not null default current_timestamp,
  constraint lead_control_mensal_pkey primary key (id),
  constraint lead_control_mensal_lead_fkey foreign key (lead_id) references public.leads (id) on delete cascade,
  constraint lead_control_mensal_lead_unique unique (lead_id)
) tablespace pg_default;

create index if not exists lead_control_mensal_lead_idx on public.lead_control_mensal using btree (lead_id);

-- 2) Trigger: cria row automatico em lead_control_mensal quando lead é inserido
create or replace function public.auto_create_lead_control_mensal()
returns trigger as $$
begin
  insert into public.lead_control_mensal (lead_id)
  values (new.id)
  on conflict (lead_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_leads_auto_control_mensal on public.leads;
create trigger trg_leads_auto_control_mensal
after insert on public.leads
for each row execute function public.auto_create_lead_control_mensal();

-- 3) View vw_metricas_mensais: agrega métricas por mês
drop view if exists public.vw_metricas_mensais;

create or replace view public.vw_metricas_mensais as
with meses as (
  select distinct date_trunc('month', l.created_at) as mes
  from public.leads l
)
select
  m.mes::date as data,
  (select count(*) from public.leads l where date_trunc('month', l.created_at) = m.mes) as leads,
  null::integer as qualificados,
  (select count(distinct h.card_id)
     from public.crm_stage_history h
     join public.crm_stages s on s.id = h.to_stage_id
     where s.slug = 'em_contato' and date_trunc('month', h.changed_at) = m.mes) as conversas,
  (select count(distinct h.card_id)
     from public.crm_stage_history h
     join public.crm_stages s on s.id = h.to_stage_id
     where s.slug = 'reuniao_agendada' and date_trunc('month', h.changed_at) = m.mes) as reunioes_agendadas,
  (select count(*) from public.leads l where l.reuniao_concluida = 1 and date_trunc('month', l.created_at) = m.mes) as reunioes_realizadas,
  (select count(distinct h.card_id)
     from public.crm_stage_history h
     join public.crm_stages s on s.id = h.to_stage_id
     where s.slug = 'proposta_enviada' and date_trunc('month', h.changed_at) = m.mes) as propostas_enviadas,
  (select count(distinct h.card_id)
     from public.crm_stage_history h
     join public.crm_stages s on s.id = h.to_stage_id
     where s.slug = 'ganho' and date_trunc('month', h.changed_at) = m.mes) as vendas
from meses m;

-- 4) RLS + Grants
alter table public.lead_control_mensal enable row level security;

drop policy if exists "lead_control_mensal_select" on public.lead_control_mensal;
create policy "lead_control_mensal_select"
  on public.lead_control_mensal for select
  to anon, authenticated
  using (true);

drop policy if exists "lead_control_mensal_update" on public.lead_control_mensal;
create policy "lead_control_mensal_update"
  on public.lead_control_mensal for update
  to anon, authenticated
  using (true) with check (true);

drop policy if exists "lead_control_mensal_insert" on public.lead_control_mensal;
create policy "lead_control_mensal_insert"
  on public.lead_control_mensal for insert
  to anon, authenticated
  with check (true);

grant select on public.vw_metricas_mensais to anon, authenticated;
grant select, update, insert on public.lead_control_mensal to anon, authenticated;
