-- =========================================================================
-- MIGRATION: Lead manual também entra no kanban (etapa 'qualificar')
-- =========================================================================
-- Antes: o trigger trg_leads_auto_add_to_crm só criava card se
--        utm_source != 'manual'. Leads criados manualmente pelo painel
--        (/api/leads com utm_source = 'manual') ficavam fora do kanban.
-- Agora: todo lead novo entra automaticamente em 'qualificar', mesmo se
--        criado pelo painel administrativo. A origem do lead continua
--        registrada em utm_source (ex: 'manual', 'google', 'instagram').
-- =========================================================================

create or replace function public.auto_add_to_crm()
returns trigger as $$
declare
  v_stage_id uuid;
begin
  select id into v_stage_id from public.crm_stages where slug = 'qualificar';
  if v_stage_id is not null then
    insert into public.crm_cards (lead_id, stage_id, priority, position)
    values (
      new.id,
      v_stage_id,
      null,
      (select coalesce(max(position), 0) + 100
         from public.crm_cards
         where stage_id = v_stage_id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- O trigger trg_leads_auto_add_to_crm já existe; não precisa recriar.
-- Caso a migration seja aplicada em ambiente sem o trigger:
drop trigger if exists trg_leads_auto_add_to_crm on public.leads;
create trigger trg_leads_auto_add_to_crm
after insert on public.leads
for each row execute function public.auto_add_to_crm();

-- Backfill: leads manuais existentes (utm_source = 'manual') que ainda
-- não têm card no CRM entram agora em 'qualificar'. Usa INSERT ... ON
-- CONFLICT para não duplicar caso já tenha card.
insert into public.crm_cards (lead_id, stage_id, priority, position)
select
  l.id,
  (select id from public.crm_stages where slug = 'qualificar'),
  null,
  (select coalesce(max(c.position), 0) + 100
     from public.crm_cards c
     where c.stage_id = (select id from public.crm_stages where slug = 'qualificar'))
from public.leads l
where l.utm_source = 'manual'
  and not exists (select 1 from public.crm_cards cc where cc.lead_id = l.id);