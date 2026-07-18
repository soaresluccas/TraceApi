-- =========================================================================
-- MIGRATION: Sincronizar colunas de controle da lead com as etapas do CRM
-- =========================================================================
-- Quando um card muda de etapa no kanban, atualiza automaticamente as
-- colunas de controle na tabela leads (respondeu, reuniao_agendada,
-- reuniao_concluida, proposta_enviada, conversao).
--
-- Mapeamento etapa → coluna:
--   reuniao_agendada  → respondeu = 1, reuniao_agendada = 1
--   fw1_sem_resposta  → respondeu = 0
--   fw2_nao_compareceu → reuniao_concluida = 0
--   proposta_enviada  → reuniao_concluida = 1, proposta_enviada = 1
--   ganho             → conversao = 1
--   fw3_nao_tomou_decisao / outro_momento / perdida → conversao = 0
-- =========================================================================

-- -------------------------------------------------------------------------
-- Função auxiliar: atualiza colunas de controle da lead conforme a etapa
-- -------------------------------------------------------------------------
create or replace function public.sync_lead_control_from_stage()
returns trigger as $$
declare
  v_slug text;
begin
  -- Pega o slug da etapa destino do card
  select slug into v_slug
  from public.crm_stages
  where id = new.stage_id;

  if v_slug is null then
    return new;
  end if;

  -- Atualiza as colunas de controle do lead conforme a etapa
  update public.leads
  set
    respondeu = case
      when v_slug = 'reuniao_agendada' then 1
      when v_slug = 'fw1_sem_resposta' then 0
      else respondeu
    end,
    reuniao_agendada = case
      when v_slug = 'reuniao_agendada' then 1
      else reuniao_agendada
    end,
    reuniao_concluida = case
      when v_slug = 'proposta_enviada' then 1
      when v_slug = 'fw2_nao_compareceu' then 0
      else reuniao_concluida
    end,
    proposta_enviada = case
      when v_slug = 'proposta_enviada' then 1
      else proposta_enviada
    end,
    conversao = case
      when v_slug = 'ganho' then 1
      when v_slug in ('fw3_nao_tomou_decisao', 'outro_momento', 'perdida') then 0
      else conversao
    end
  where id = new.lead_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- -------------------------------------------------------------------------
-- Atualiza a trigger de log para também sincronizar as colunas de controle
-- -------------------------------------------------------------------------
create or replace function public.log_crm_stage_change_after()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.crm_stage_history (card_id, from_stage_id, to_stage_id)
    values (new.id, null, new.stage_id);

    -- Sincroniza colunas de controle na criação do card
    perform public.sync_lead_control_from_stage(new);

  elsif (tg_op = 'UPDATE' and old.stage_id is distinct from new.stage_id) then
    insert into public.crm_stage_history (card_id, from_stage_id, to_stage_id)
    values (new.id, old.stage_id, new.stage_id);

    -- Sincroniza colunas de controle ao mudar de etapa
    perform public.sync_lead_control_from_stage(new);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- -------------------------------------------------------------------------
-- Sincroniza colunas de controle para cards já existentes
-- (útil ao aplicar a migration em ambiente com dados existentes)
-- -------------------------------------------------------------------------
update public.leads l
set
  respondeu = case
    when s.slug = 'reuniao_agendada' then 1
    when s.slug = 'fw1_sem_resposta' then 0
    else l.respondeu
  end,
  reuniao_agendada = case
    when s.slug = 'reuniao_agendada' then 1
    else l.reuniao_agendada
  end,
  reuniao_concluida = case
    when s.slug = 'proposta_enviada' then 1
    when s.slug = 'fw2_nao_compareceu' then 0
    else l.reuniao_concluida
  end,
  proposta_enviada = case
    when s.slug = 'proposta_enviada' then 1
    else l.proposta_enviada
  end,
  conversao = case
    when s.slug = 'ganho' then 1
    when s.slug in ('fw3_nao_tomou_decisao', 'outro_momento', 'perdida') then 0
    else l.conversao
  end
from public.crm_cards c
join public.crm_stages s on s.id = c.stage_id
where c.lead_id = l.id;
