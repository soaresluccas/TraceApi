-- =========================================================================
-- MIGRATION: Adiciona coluna observacao na tabela crm_cards
-- =========================================================================

alter table public.crm_cards
  add column if not exists observacao text null;
