-- =========================================================================
-- MIGRATION: Função SQL para recalcular métricas mensais automáticas
-- =========================================================================
-- CPL, MQL, CPR, % Conversão e ROAS são calculados a partir dos dados
-- agregados do mês. Investimento vem de investimento_mensal (mais recente).
-- Faturamento vem de leads.faturamento (soma de todos os leads do mês).
-- Resultado é gravado (upsert) em lead_control_mensal (um row por mês).
-- =========================================================================

create or replace function public.recalculate_monthly_metrics(p_month text)
returns table(
  total_leads bigint,
  total_investimento numeric,
  total_faturamento numeric,
  qualificados bigint,
  reunioes_realizadas bigint,
  vendas bigint,
  cpl numeric,
  mql_pct numeric,
  cpr numeric,
  pct_conversao numeric,
  roas numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_start date := (p_month || '-01')::date;
  v_end date := (v_start + interval '1 month')::date;
  v_total_leads bigint;
  v_total_investimento numeric := 0;
  v_total_faturamento numeric := 0;
  v_qualificados bigint;
  v_reunioes bigint;
  v_vendas bigint;
  v_cpl numeric;
  v_mql numeric;
  v_cpr numeric;
  v_pct_conv numeric;
  v_roas numeric;
begin
  select count(*) into v_total_leads
  from public.leads l
  where l.created_at >= v_start and l.created_at < v_end;

  select coalesce(sum(l.faturamento), 0)
  into v_total_faturamento
  from public.leads l
  where l.created_at >= v_start and l.created_at < v_end;

  select coalesce(im.valor, 0)
  into v_total_investimento
  from public.investimento_mensal im
  where im.mes = p_month
  order by im.created_at desc
  limit 1;

  select count(*) into v_qualificados
  from public.leads l
  where l.created_at >= v_start and l.created_at < v_end
  and l.curva_abc in (0, 1);

  select count(*) into v_reunioes
  from public.leads l
  where l.created_at >= v_start and l.created_at < v_end
  and (
    l.reuniao_concluida = 1
    or exists (
      select 1 from public.crm_cards c
      join public.crm_stages s on s.id = c.stage_id
      where c.lead_id = l.id and s.slug in ('reuniao_agendada')
    )
  );

  select count(*) into v_vendas
  from public.leads l
  where l.created_at >= v_start and l.created_at < v_end
  and (
    l.conversao = 1
    or exists (
      select 1 from public.crm_cards c
      join public.crm_stages s on s.id = c.stage_id
      where c.lead_id = l.id and s.slug = 'ganho'
    )
  );

  v_cpl := case when v_total_leads > 0 then round(v_total_investimento / v_total_leads, 2) else null end;
  v_mql := case when v_total_leads > 0 then round((v_qualificados::numeric / v_total_leads) * 100, 2) else null end;
  v_cpr := case when v_reunioes > 0 then round(v_total_investimento / v_reunioes, 2) else null end;
  v_pct_conv := case when v_total_leads > 0 then round((v_vendas::numeric / v_total_leads) * 100, 2) else null end;
  v_roas := case when v_total_investimento > 0 then round(v_total_faturamento / v_total_investimento, 2) else null end;

  insert into public.lead_control_mensal (
    mes, cpl, mql, cpr, pct_conversao, roas,
    total_faturamento, total_investimento, total_leads,
    qualificados, reunioes_realizadas, vendas
  )
  values (
    p_month, v_cpl, v_mql, v_cpr, v_pct_conv, v_roas,
    v_total_faturamento, v_total_investimento, v_total_leads,
    v_qualificados, v_reunioes, v_vendas
  )
  on conflict (mes) do update set
    cpl = excluded.cpl,
    mql = excluded.mql,
    cpr = excluded.cpr,
    pct_conversao = excluded.pct_conversao,
    roas = excluded.roas,
    total_faturamento = excluded.total_faturamento,
    total_investimento = excluded.total_investimento,
    total_leads = excluded.total_leads,
    qualificados = excluded.qualificados,
    reunioes_realizadas = excluded.reunioes_realizadas,
    vendas = excluded.vendas,
    updated_at = current_timestamp;

  return query
  select
    v_total_leads,
    v_total_investimento,
    v_total_faturamento,
    v_qualificados,
    v_reunioes,
    v_vendas,
    v_cpl,
    v_mql,
    v_cpr,
    v_pct_conv,
    v_roas;
end;
$$;

grant execute on function public.recalculate_monthly_metrics(text) to anon, authenticated;
