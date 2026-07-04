-- =========================================================================
-- MIGRATION: CRM Kanban - Stored Functions (SECURITY DEFINER)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1.0 GRANTS
-- -------------------------------------------------------------------------
grant select on public.vw_crm_funil to anon, authenticated;
grant select on public.vw_crm_tempo_medio_por_etapa to anon, authenticated;

-- -------------------------------------------------------------------------
-- 1.1 create_card(lead_id, stage_id, priority)
-- -------------------------------------------------------------------------
create or replace function public.create_card(
  p_lead_id uuid,
  p_stage_id uuid default null,
  p_priority text default null
)
returns public.crm_cards
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_stage_id uuid;
  v_position integer;
  v_existing uuid;
  v_card public.crm_cards;
begin
  select id into v_existing from public.crm_cards where lead_id = p_lead_id;
  if v_existing is not null then
    raise exception 'Lead already has a card in the CRM'
      using errcode = '23505';
  end if;

  if p_stage_id is null then
    select id into v_stage_id from public.crm_stages where slug = 'qualificar';
    if v_stage_id is null then
      raise exception 'Default stage "qualificar" not found'
        using errcode = '23503';
    end if;
  else
    v_stage_id := p_stage_id;
  end if;

  select coalesce(max(position), 0) + 100 into v_position
  from public.crm_cards where stage_id = v_stage_id;

  insert into public.crm_cards (lead_id, stage_id, priority, position)
  values (p_lead_id, v_stage_id, p_priority, v_position)
  returning * into v_card;

  return v_card;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.2 move_card(card_id, to_stage_id, new_position)
-- -------------------------------------------------------------------------
create or replace function public.move_card(
  p_card_id uuid,
  p_to_stage_id uuid,
  p_new_position integer default null
)
returns public.crm_cards
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_position integer;
  v_card public.crm_cards;
begin
  if p_new_position is null then
    select coalesce(max(position), 0) + 100 into v_position
    from public.crm_cards where stage_id = p_to_stage_id;
  else
    v_position := p_new_position;
  end if;

  update public.crm_cards
  set stage_id = p_to_stage_id,
      position = v_position
  where id = p_card_id
  returning * into v_card;

  if v_card is null then
    raise exception 'Card not found'
      using errcode = 'PGRST116';
  end if;

  return v_card;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.3 reorder_cards(stage_id, card_id, new_position)
-- -------------------------------------------------------------------------
create or replace function public.reorder_cards(
  p_stage_id uuid,
  p_card_id uuid,
  p_new_position integer
)
returns setof public.crm_cards
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_min_gap numeric;
  v_count integer;
  v_i integer;
  v_card record;
begin
  update public.crm_cards
  set position = p_new_position
  where id = p_card_id and stage_id = p_stage_id;

  select min(abs(a.position - b.position))
  into v_min_gap
  from public.crm_cards a
  join public.crm_cards b on a.stage_id = b.stage_id and a.id < b.id
  where a.stage_id = p_stage_id;

  if v_min_gap is not null and v_min_gap < 1 then
    select count(*) into v_count
    from public.crm_cards where stage_id = p_stage_id;

    v_i := 0;
    for v_card in select id from public.crm_cards where stage_id = p_stage_id order by position asc loop
      v_i := v_i + 1;
      update public.crm_cards set position = v_i * 100 where id = v_card.id;
    end loop;
  end if;

  return query
  select * from public.crm_cards where stage_id = p_stage_id order by position asc;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.4 get_board()
-- -------------------------------------------------------------------------
create or replace function public.get_board()
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result json;
begin
  select json_agg(
    json_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'position', s.position,
      'color', s.color,
      'is_closed', s.is_closed,
      'cards', coalesce(
        (select json_agg(
          json_build_object(
            'id', c.id,
            'lead_id', c.lead_id,
            'stage_id', c.stage_id,
            'priority', c.priority,
            'position', c.position,
            'assigned_to', c.assigned_to,
            'entered_stage_at', c.entered_stage_at,
            'closed_at', c.closed_at,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'lead', json_build_object(
              'id', l.id,
              'name', l.name,
              'whatsapp', l.whatsapp,
              'instagram', l.instagram,
              'curva_abc', l.curva_abc
            )
          )
          order by c.position asc
        )
        from public.crm_cards c
        left join public.leads l on l.id = c.lead_id
        where c.stage_id = s.id
        ),
        '[]'::json
      )
    )
    order by s.position asc
  )
  into v_result
  from public.crm_stages s;

  return v_result;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.5 get_leads_not_in_crm(search, limit, offset)
-- -------------------------------------------------------------------------
create or replace function public.get_leads_not_in_crm(
  p_search text default null,
  p_limit integer default 10,
  p_offset integer default 0
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result json;
begin
  select json_build_object(
    'data', coalesce(
      (select json_agg(
        json_build_object(
          'id', l.id,
          'name', l.name,
          'whatsapp', l.whatsapp,
          'instagram', l.instagram
        )
        order by l.created_at desc
      )
      from (
        select l.id, l.name, l.whatsapp, l.instagram, l.created_at
        from public.leads l
        where l.id not in (select lead_id from public.crm_cards)
          and (
            p_search is null
            or l.name ilike '%' || p_search || '%'
            or l.instagram ilike '%' || p_search || '%'
            or l.whatsapp ilike '%' || p_search || '%'
          )
        order by l.created_at desc
        limit p_limit
        offset p_offset
      ) l
      ),
      '[]'::json
    ),
    'total', (
      select count(*)
      from public.leads l
      where l.id not in (select lead_id from public.crm_cards)
        and (
          p_search is null
          or l.name ilike '%' || p_search || '%'
          or l.instagram ilike '%' || p_search || '%'
          or l.whatsapp ilike '%' || p_search || '%'
        )
    )
  ) into v_result;

  return v_result;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.6 update_card(card_id, priority, assigned_to)
-- -------------------------------------------------------------------------
create or replace function public.update_card(
  p_card_id uuid,
  p_priority text default null,
  p_assigned_to text default null
)
returns public.crm_cards
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_card public.crm_cards;
begin
  update public.crm_cards
  set priority = coalesce(p_priority, priority),
      assigned_to = coalesce(p_assigned_to, assigned_to)
  where id = p_card_id
  returning * into v_card;

  if v_card is null then
    raise exception 'Card not found'
      using errcode = 'PGRST116';
  end if;

  return v_card;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.7 delete_card(card_id)
-- -------------------------------------------------------------------------
create or replace function public.delete_card(
  p_card_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer;
begin
  delete from public.crm_cards where id = p_card_id returning 1 into v_deleted;

  if v_deleted is null then
    raise exception 'Card not found'
      using errcode = 'PGRST116';
  end if;

  return true;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.8 get_card(card_id)
-- -------------------------------------------------------------------------
create or replace function public.get_card(
  p_card_id uuid
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result json;
begin
  select json_build_object(
    'id', c.id,
    'lead_id', c.lead_id,
    'stage_id', c.stage_id,
    'priority', c.priority,
    'position', c.position,
    'assigned_to', c.assigned_to,
    'entered_stage_at', c.entered_stage_at,
    'closed_at', c.closed_at,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'lead', json_build_object(
      'id', l.id,
      'name', l.name,
      'whatsapp', l.whatsapp,
      'instagram', l.instagram,
      'curva_abc', l.curva_abc
    )
  )
  into v_result
  from public.crm_cards c
  join public.leads l on l.id = c.lead_id
  where c.id = p_card_id;

  if v_result is null then
    raise exception 'Card not found'
      using errcode = 'PGRST116';
  end if;

  return v_result;
end;
$$;

-- -------------------------------------------------------------------------
-- 1.9 get_card_history(card_id)
-- -------------------------------------------------------------------------
create or replace function public.get_card_history(
  p_card_id uuid
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result json;
begin
  select json_agg(
    json_build_object(
      'id', h.id,
      'card_id', h.card_id,
      'from_stage_id', h.from_stage_id,
      'to_stage_id', h.to_stage_id,
      'changed_at', h.changed_at,
      'from_stage_name', fs.name,
      'to_stage_name', ts.name
    )
    order by h.changed_at desc
  )
  into v_result
  from public.crm_stage_history h
  left join public.crm_stages fs on fs.id = h.from_stage_id
  join public.crm_stages ts on ts.id = h.to_stage_id
  where h.card_id = p_card_id;

  return coalesce(v_result, '[]'::json);
end;
$$;

-- -------------------------------------------------------------------------
-- GRANT EXECUTE nas stored functions
-- -------------------------------------------------------------------------
grant execute on function public.create_card, public.move_card, public.reorder_cards, public.get_board, public.get_leads_not_in_crm, public.update_card, public.delete_card, public.get_card, public.get_card_history to anon, authenticated;
