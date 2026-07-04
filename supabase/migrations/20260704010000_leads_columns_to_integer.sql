-- =========================================================================
-- MIGRATION: Cria colunas de controle da tabela leads como integer null
-- =========================================================================

alter table public.leads
  add column if not exists respondeu integer null,
  add column if not exists reuniao_agendada integer null,
  add column if not exists reuniao_concluida integer null,
  add column if not exists proposta_enviada integer null,
  add column if not exists conversao integer null,
  add column if not exists objecao integer null;
