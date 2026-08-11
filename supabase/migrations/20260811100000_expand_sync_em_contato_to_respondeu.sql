-- =========================================================================
-- MIGRATION: Expandir sync kanban → controle por lead
-- =========================================================================
-- Mudanças em relação a 20260704110000:
--   * Adiciona regra: card que entra em 'em_contato' marca respondeu = 1
--   * Backfill de conversao = 0 para cards em estágios intermediários
--     (em_contato, fw1_sem_resposta, fw2_nao_compareceu) que ainda
--     estejam com conversao = 1 no leads
--
-- Conforme combinado:
--   * NÃO mexer em respondeu de cards que já estão hoje em em_contato
--     (só aplicar a regra a partir de agora, em movimentos futuros)
-- =========================================================================

-- -------------------------------------------------------------------------
-- Recria função de sincronização incluindo o caso em_contato → respondeu
-- -------------------------------------------------------------------------
create or replace function public.sync_lead_control_from_stage()
returns trigger as $$
declare
  v_slug text;
begin
  select slug into v_slug
  from public.crm_stages
  where id = new.stage_id;

  if v_slug is null then
    return new;
  end if;

  update public.leads
  set
    respondeu = case
      when v_slug = 'em_contato'       then 1
      when v_slug = 'reuniao_agendada' then 1
      when v_slug = 'fw1_sem_resposta' then 0
      else respondeu
    end,
    reuniao_agendada = case
      when v_slug = 'reuniao_agendada' then 1
      else reuniao_agendada
    end,
    reuniao_concluida = case
      when v_slug = 'proposta_enviada'   then 1
      when v_slug = 'fw2_nao_compareceu' then 0
      else reuniao_concluida
    end,
    proposta_enviada = case
      when v_slug = 'proposta_enviada' then 1
      else proposta_enviada
    end,
    conversao = case
      when v_slug = 'ganho' then 1
      when v_slug in (
        'fw3_nao_tomou_decisao',
        'outro_momento',
        'perdida'
      ) then 0
      else conversao
    end
  where id = new.lead_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- -------------------------------------------------------------------------
-- Recria trigger AFTER para continuar chamando a função atualizada
-- (mantém o INSERT/UPDATE e o registro no histórico como antes)
-- -------------------------------------------------------------------------
create or replace function public.log_crm_stage_change_after()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.crm_stage_history (card_id, from_stage_id, to_stage_id)
    values (new.id, null, new.stage_id);

    perform public.sync_lead_control_from_stage(new);

  elsif (tg_op = 'UPDATE' and old.stage_id is distinct from new.stage_id) then
    insert into public.crm_stage_history (card_id, from_stage_id, to_stage_id)
    values (new.id, old.stage_id, new.stage_id);

    perform public.sync_lead_control_from_stage(new);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- -------------------------------------------------------------------------
-- Backfill de conversao = 0 para cards em estágios intermediários
-- (em_contato, fw1_sem_resposta, fw2_nao_compareceu). Quem já está
-- em 'ganho' não é tocado.
-- -------------------------------------------------------------------------
update public.leads l
set conversao = 0,
    updated_at = current_timestamp
from public.crm_cards c
join public.crm_stages s on s.id = c.stage_id
where c.lead_id = l.id
  and l.conversao is distinct from 0
  and s.slug in ('em_contato', 'fw1_sem_resposta', 'fw2_nao_compareceu');
