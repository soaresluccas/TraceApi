# CRM Kanban Backend - Documentação da Implementação

Feature de CRM Kanban no backend da TraceApi, permitindo gerenciar leads em um funil de vendas visual com stages (colunas) e cards (leads), incluindo drag-and-drop, métricas e histórico de movimentação.

---

## Decisões Técnicas

- **Supabase RPC** com stored functions `SECURITY DEFINER` para operações atômicas (bypassa RLS — auth controlada pelo Express middleware)
- **`set search_path = public, pg_temp`** em toda function SECURITY DEFINER (segurança contra schema hijacking)
- **Position com gap de 100** (10, 20, 30...) em vez de sequencial — reindex só quando gap < 1
- **Sem WebSocket** (uso single-user)
- **Entidades em snake_case** (padrão do projeto)
- **`get_leads_not_in_crm`** no módulo de Leads (não no CRM) para manter separação de contexto
- **GRANT SELECT** nas views e **GRANT EXECUTE** nas stored functions para `anon` e `authenticated`
- **Mapeamento de erros Postgres → HTTP** padronizado via helper `mapPostgresError`

---

## Endpoints

### CRM (`/api/crm` — autenticado)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/stages` | Lista as fases ordenadas (monta as colunas do board) |
| GET | `/board` | Endpoint principal — retorna stages + cards agrupados com dados do lead via join |
| POST | `/cards` | Adiciona um lead ao funil. Body: `{ lead_id, stage_id?, priority? }` |
| PATCH | `/cards/reorder` | Reordenar cards dentro da mesma coluna. Body: `{ stage_id, card_id, new_position }` |
| PATCH | `/cards/:id/move` | Mover card entre colunas. Body: `{ stage_id, position? }` |
| PATCH | `/cards/:id` | Editar dados do card (priority, assigned_to) sem mudar de fase |
| GET | `/cards/:id` | Detalhe do card + dados do lead |
| GET | `/cards/:id/history` | Histórico de movimentação do card |
| DELETE | `/cards/:id` | Remove o card do board (não deleta o lead) |
| GET | `/metrics/funnel` | Contagem por etapa (view `vw_crm_funil`) |
| GET | `/metrics/tempo-medio` | Tempo médio em cada fase (view `vw_crm_tempo_medio_por_etapa`) |

### Leads (`/api/leads` — autenticado)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/?not_in_crm=true&search=...` | Busca leads que ainda não estão no funil |

---

## Mapeamento de Erros Postgres → HTTP

| SQLSTATE | Significado | HTTP | Quando |
|---|---|---|---|
| 23505 | unique_violation | 409 | Lead já possui card no CRM |
| 23503 | foreign_key_violation | 400 | stage_id ou lead_id inválido |
| 23514 | check_violation | 400 | priority fora do enum |
| PGRST116 | not_found | 404 | Card não encontrado |
| outros | — | 500 | Erro inesperado |

---

## Stored Functions (Migration)

Arquivo: `supabase/migrations/20260704020000_crm_stored_functions.sql`

### `create_card(lead_id uuid, stage_id uuid default null, priority text default null)`
- SECURITY DEFINER + `set search_path = public, pg_temp`
- Se `stage_id` null, busca stage com slug = 'qualificar'
- Verifica se lead já tem card → RAISE EXCEPTION com SQLSTATE '23505'
- Position = max(position) + 100 dentro do stage (ou 100 se vazio)
- Trigger `log_crm_stage_change` loga histórico automaticamente
- Retorna o card criado

### `move_card(card_id uuid, to_stage_id uuid, new_position integer default null)`
- SECURITY DEFINER + `set search_path = public, pg_temp`
- Se `new_position` null, coloca no final (max + 100)
- Update stage_id + position
- Trigger loga histórico e marca closed_at se stage for is_closed
- Retorna o card atualizado

### `reorder_cards(stage_id uuid, card_id uuid, new_position integer)`
- SECURITY DEFINER + `set search_path = public, pg_temp`
- Update position do card dentro do mesmo stage
- Se gap entre cards adjacentes < 1, reindexa todos os cards do stage com gap de 100
- Retorna os cards reordenados do stage

### `get_board()`
- SECURITY DEFINER + `set search_path = public, pg_temp`
- Retorna JSON com stages + cards + dados do lead (name, whatsapp, instagram, curva_abc)
- Ordenado por position dentro de cada stage

### `get_leads_not_in_crm(search text default null, limit int default 10, offset int default 0)`
- SECURITY DEFINER + `set search_path = public, pg_temp`
- Retorna leads que não têm card no CRM (NOT IN subquery)
- Filtro opcional por name/instagram/whatsapp (ILIKE)
- Retorna `{ data, total }`

### Grants
```sql
grant select on public.vw_crm_funil to anon, authenticated;
grant select on public.vw_crm_tempo_medio_por_etapa to anon, authenticated;
grant execute on function public.create_card, public.move_card, public.reorder_cards, public.get_board, public.get_leads_not_in_crm to anon, authenticated;
```

---

## Arquitetura

```
src/
  domain/
    entities/
      CrmStage.ts              # Entidade + interface ICrmStage
      CrmCard.ts               # Entidade + interface ICrmCard
      CrmStageHistory.ts       # Entidade + interface ICrmStageHistory
    interfaces/
      ICrmRepository.ts        # Contrato do repositório CRM + DTOs
      ILeadRepository.ts       # Modificado: + findAllNotInCrm + LeadNotInCrmDTO
  infrastructure/
    repositories/
      CrmRepository.ts         # Implementação via supabase.rpc() e supabase.from()
      LeadRepository.ts        # Modificado: + findAllNotInCrm via RPC
  application/
    use-cases/
      crm/
        CreateCardUseCase.ts
        MoveCardUseCase.ts
        ReorderCardUseCase.ts
        UpdateCardUseCase.ts
        DeleteCardUseCase.ts
        ListStagesUseCase.ts
        GetBoardUseCase.ts
        GetCardUseCase.ts
        GetCardHistoryUseCase.ts
        GetFunnelMetricsUseCase.ts
        GetTempoMedioUseCase.ts
        index.ts
      ListLeadsNotInCrmUseCase.ts
  presentation/
    controllers/
      CrmController.ts         # 11 métodos + mapPostgresError helper
      LeadController.ts        # Modificado: + listNotInCrm
    routes/
      crm.ts                   # 11 rotas sob /api/crm
      lead.ts                  # Modificado: GET / com ?not_in_crm=true
  app.ts                       # Modificado: CrmRepository, CrmController, /api/crm
```

---

## Fluxo de Dados

1. **Request** chega na rota Express (`crm.ts` ou `lead.ts`)
2. **Controller** (`CrmController` ou `LeadController`) extrai parâmetros do request
3. **UseCase** valida regras de negócio (campos obrigatórios, enum de priority)
4. **Repository** (`CrmRepository` ou `LeadRepository`) executa via `supabase.rpc()` (stored functions) ou `supabase.from()` (queries simples/views)
5. **Controller** mapeia erros Postgres para HTTP via `mapPostgresError` e retorna JSON

---

## Estratégia de Position (Drag and Drop)

- Posições usam gap de 100 (100, 200, 300...)
- Ao mover entre dois cards: calcula média das posições vizinhas
- Só reindexa tudo (gap de 100 sequencial) quando gap < 1
- Isso reduz o `/move` e `/reorder` pra um único UPDATE na maioria dos casos

---

## Validações

- **create_card**: `lead_id` obrigatório, `priority` deve ser `Baixa | Normal | Alta | Urgente`, lead não pode ter card duplicado (constraint `crm_cards_lead_unique` + checagem na function)
- **move_card**: `card_id` e `stage_id` obrigatórios
- **reorder_cards**: `stage_id`, `card_id` e `new_position` obrigatórios
- **update_card**: `card_id` obrigatório, `priority` deve estar no enum se informado
- **delete_card**: `card_id` obrigatório
