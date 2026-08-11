-- =========================================================================
-- MIGRATION: Fix signature de sync_lead_control_from_stage
-- =========================================================================
-- A function foi criada em 20260704110000 com aridade 0
-- (parênteses vazias), mas o trigger log_crm_stage_change_after
-- chama ela como sync_lead_control_from_stage(new), onde new é
-- do tipo crm_cards. Resultado: SQLSTATE 42883 ao mover/criar
-- card ("function does not exist").
--
-- Esta migration dropa a function com aridade 0 e recria com aridade 1,
-- recebendo o card (crm_cards) por parâmetro. O comportamento interno
-- não muda — só a assinatura.
-- =========================================================================

drop function if exists public.sync_lead_control_from_stage();

create or replace function public.sync_lead_control_from_stage(card public.crm_cards)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slug text;
begin
  select slug into v_slug
  from public.crm_stages
  where id = card.stage_id;

  if v_slug is null then
    return;
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
  where id = card.lead_id;
end;
$$;

-- Como a function agora é void (não trigger), mas o perform
-- continua chamando ela passando new, isso continua válido.
-- Não há mudança necessária em log_crm_stage_change_after.

-- Verificação rápida após rodar:
-- \df public.sync_lead_control_from_stage
-- deve mostrar 1 argumento: card crm_cards
