-- =========================================================================
-- MIGRATION: Tabela investimento_mensal (investimento por mês, não por lead)
-- =========================================================================
-- Permite múltiplas inserções por mês; o recálculo usa a mais recente.
-- =========================================================================

create table if not exists public.investimento_mensal (
  id uuid not null default gen_random_uuid(),
  mes text not null,
  valor numeric(12, 2) not null,
  created_at timestamp with time zone not null default current_timestamp,
  constraint investimento_mensal_pkey primary key (id)
) tablespace pg_default;

create index if not exists investimento_mensal_mes_idx
  on public.investimento_mensal using btree (mes);

create index if not exists investimento_mensal_mes_created_idx
  on public.investimento_mensal using btree (mes, created_at desc);

alter table public.investimento_mensal enable row level security;

drop policy if exists "investimento_mensal_select" on public.investimento_mensal;
create policy "investimento_mensal_select"
  on public.investimento_mensal for select
  to anon, authenticated
  using (true);

drop policy if exists "investimento_mensal_insert" on public.investimento_mensal;
create policy "investimento_mensal_insert"
  on public.investimento_mensal for insert
  to anon, authenticated
  with check (true);

drop policy if exists "investimento_mensal_update" on public.investimento_mensal;
create policy "investimento_mensal_update"
  on public.investimento_mensal for update
  to anon, authenticated
  using (true) with check (true);

drop policy if exists "investimento_mensal_delete" on public.investimento_mensal;
create policy "investimento_mensal_delete"
  on public.investimento_mensal for delete
  to anon, authenticated
  using (true);

grant select, insert, update, delete on public.investimento_mensal to anon, authenticated;
