-- =========================================================================
-- MIGRATION: Redesign lead_control_mensal de per-lead para mensal
-- =========================================================================
-- 1. Dropar trigger/função que criava row automático por lead
-- 2. Dropar tabela lead_control_mensal antiga (per-lead)
-- 3. Adicionar faturamento na tabela leads (per-lead, manual)
-- 4. Recriar lead_control_mensal como tabela mensal (um row por mês)
-- =========================================================================

drop trigger if exists trg_leads_auto_control_mensal on public.leads;
drop function if exists public.auto_create_lead_control_mensal() cascade;

drop table if exists public.lead_control_mensal cascade;

alter table public.leads
  add column if not exists faturamento numeric(12, 2) null;

create table if not exists public.lead_control_mensal (
  id uuid not null default gen_random_uuid(),
  mes text not null,
  cpl numeric(12, 2) null,
  mql numeric(6, 2) null,
  cpr numeric(12, 2) null,
  pct_conversao numeric(6, 2) null,
  roas numeric(8, 2) null,
  total_faturamento numeric(12, 2) null,
  total_investimento numeric(12, 2) null,
  total_leads bigint null,
  qualificados bigint null,
  reunioes_realizadas bigint null,
  vendas bigint null,
  created_at timestamp with time zone not null default current_timestamp,
  updated_at timestamp with time zone not null default current_timestamp,
  constraint lead_control_mensal_pkey primary key (id),
  constraint lead_control_mensal_mes_unique unique (mes)
) tablespace pg_default;

create index if not exists lead_control_mensal_mes_idx
  on public.lead_control_mensal using btree (mes);

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

drop policy if exists "lead_control_mensal_delete" on public.lead_control_mensal;
create policy "lead_control_mensal_delete"
  on public.lead_control_mensal for delete
  to anon, authenticated
  using (true);

grant select, insert, update, delete on public.lead_control_mensal to anon, authenticated;
