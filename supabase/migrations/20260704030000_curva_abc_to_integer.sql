-- =========================================================================
-- MIGRATION: Altera curva_abc de text para integer
-- =========================================================================

alter table public.leads drop constraint if exists leads_curva_abc_check;

update public.leads
  set curva_abc = '0'
  where curva_abc = 'A';

update public.leads
  set curva_abc = '1'
  where curva_abc = 'B';

update public.leads
  set curva_abc = '2'
  where curva_abc = 'C';

drop view if exists public.vw_metricas_diarias_calculadas;

alter table public.leads
  alter column curva_abc type integer
  using curva_abc::integer;

alter table public.leads
  add constraint leads_curva_abc_check
  check (curva_abc is null or curva_abc in (0, 1, 2));

create or replace view public.vw_metricas_diarias_calculadas as
select
  date(l.created_at) as data,
  count(*) as leads,
  count(*) filter (where l.curva_abc is not null) as qualificados,
  count(*) filter (where l.respondeu = 1) as conversas,
  count(*) filter (where l.reuniao_agendada = 1) as reunioes_agendadas,
  count(*) filter (where l.reuniao_concluida = 1) as reunioes_realizadas,
  count(*) filter (where l.proposta_enviada = 1) as propostas_enviadas,
  count(*) filter (where l.conversao = 1) as vendas
from public.leads l
group by date(l.created_at);

