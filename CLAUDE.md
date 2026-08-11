# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Trace Company API — REST API (Node 20 / TypeScript 5 / Express 4) for capturing leads from a fitness consulting landing page, plus a CRM kanban and monthly metrics dashboard. Backed by Supabase (Postgres + RLS) and deployed as a Vercel serverless function. Notifications about new leads are sent via Brevo.

The project lives in Portuguese (BR). Comments, log strings, and error messages are in pt-BR; entity field names and DB columns stay in snake_case English. The frontend for this product is a separate project — this repo is the API only.

## Commands

```bash
npm install              # install dependencies
npm run dev              # local dev with hot-reload (tsx src/index.ts)
npm run build            # compile TypeScript → dist/ (tsc)
npm start                # run compiled server (node dist/src/index.js)
npm run lint             # type-check only (tsc --noEmit)
npm run clean            # delete dist/
npm run swagger          # emit swagger spec (tsc src/docs/swagger.ts)
```

There is no automated test suite. Manual smoke test flow: `npm run dev`, then `curl http://localhost:3000/health`. For Brevo, build and run `node dist/test-email.js` to validate the notification service (see `DIAGNOSTICO-EMAIL.md`).

`.env` is committed to the repo for convenience — it currently holds the dev Supabase project, JWT secret, Brevo API key, and CORS allowlist. Do not commit a new `.env` with different secrets; treat the existing one as dev-only.

## Architecture (DDD)

```
src/
  domain/            # Pure business — no framework imports
    entities/        # Lead, User, CrmStage, CrmCard, CrmStageHistory
    interfaces/      # ILeadRepository, IUserRepository, ICrmRepository,
                     # IMetricsRepository, ILeadNotificationService
    services/        # MetricsCalculationService (CPL, MQL, CPR, %conv, ROAS)
    utils/           # parseBRCurrency
  application/
    use-cases/       # One class per business action; validates with Zod
  infrastructure/
    config/          # initSupabase() / getSupabase() — single client
    repositories/    # Supabase impls of the domain interfaces
    services/        # AuthService (JWT + bcrypt), BrevoLeadNotificationService
  presentation/
    controllers/     # HTTP handlers — one controller per aggregate
    routes/          # Express routers wired in app.ts
    middleware/      # authMiddleware (JWT), rateLimitMiddleware (in-memory)
  docs/swagger.ts    # OpenAPI 3.0 spec for Swagger UI
  app.ts             # Express bootstrap, DI wiring, route mounting
  index.ts           # Entry — only listens when not production (Vercel exports app)

api/server.ts        # Vercel serverless entrypoint — wraps the Express app
supabase/migrations/ # SQL migrations (leads extensions, CRM, metrics, RPCs)
```

Layer rule: `presentation → application → domain ← infrastructure`. Domain never imports from application/presentation/infrastructure. Use cases only depend on `I*Repository` interfaces, not concrete Supabase classes — that's how DI in `app.ts` works.

Wiring is in `src/app.ts`: `initSupabase()` → repositories → optional `BrevoLeadNotificationService` → controllers → route factories → `app.use(...)`. To add a new endpoint, follow the order: entity → interface → repository → use case (with Zod) → controller method → route.

## Key flows

- **Public lead capture** — `POST /api/leads` is the only public lead route (rate-limited via `LEAD_RATE_LIMIT_*` envs). The use case (`CreateLeadUseCase`) Zod-validates input, calls `Lead.create(...)`, persists via `LeadRepository.create`, then fires `ILeadNotificationService.notifyNewLead` (Brevo). Notification errors are caught and logged; lead creation does not fail on email failure.
- **Auth** — `RegisterUseCase` bcrypts the password and inserts into `users`. `LoginUseCase` compares and returns a JWT signed by `AuthService` (`JWT_SECRET` / `JWT_EXPIRATION`). All non-auth and non-public-lead routes are protected by `authMiddleware` which decodes the Bearer token and attaches `userId` / `email` to the request.
- **Lead control (planilha individual)** — `PATCH /api/leads/control/:id` updates per-lead funnel fields (`faturamento`, `curva_abc`, `respondeu`, `reuniao_agendada`, `reuniao_concluida`, `proposta_enviada`, `conversao`, `objecao`). `faturamento` accepts BR-currency strings via `parseBRCurrency` (`"R$ 1.234,56"` → `1234.56`).
- **CRM kanban** — under `/api/crm`. Stages are seeded by the migration (`qualificar` … `ganho`/`perdida`, both `is_closed`). Card lifecycle goes through Supabase RPCs (`create_card`, `move_card`, `reorder_cards`, `get_board`, `get_card`, `get_card_history`, `delete_card`) — all `SECURITY DEFINER` with `set search_path = public, pg_temp`. Errors are translated in `CrmController.mapPostgresError` (23505 → 409, 23503 → 400, 23514 → 400, PGRST116 → 404). Position uses gap-of-100; reindex only when gap < 1.
- **Monthly metrics** — under `/api/metrics`. Backed by views (`vw_metricas_mensais`, `lead_control_mensal`) and the `recalculate_monthly_metrics` RPC plus the `investimento_mensal` table. `parseBRCurrency` is applied to incoming `valor` before upsert.

## Conventions

- **snake_case** in entities, DTOs, DB columns, RPC params — matching the project standard.
- **Zod** is used in use cases, not controllers, for validation. Most write use cases call `.strict()` (e.g. `CreateLeadInputSchema`) to reject extra fields.
- **Postgres error mapping** lives next to the controller that needs it (`mapPostgresError` in `CrmController`).
- **DI** is done explicitly in `app.ts` — repositories are constructed there and passed down. Use cases instantiate themselves inside controllers/services with the repository they received.
- **Entities** expose `fromDatabase()`, `toPrimitive()`, and mutator methods. Repositories convert DB rows through `fromDatabase`; controllers serialize through `toPrimitive`.
- **Controllers** are constructed with their dependencies, then expose one async method per route. Errors are caught, mapped to an HTTP status, and returned as `{ success: false, message }`.
- **Routes** are factory functions (`createLeadRoutes(controller)`) so they can be mounted twice when needed — `publicLeadRoutes` and `authMiddleware + leadRoutes` both mount under `/api/leads` (see `app.ts`).

## Environment variables

`PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CORS_ORIGIN` (comma-separated, `*` allowed), `JWT_SECRET`, `JWT_EXPIRATION` (default `24h`), `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `LEAD_NOTIFICATION_EMAIL`, `LEAD_RATE_LIMIT_WINDOW_MS` (default 60000), `LEAD_RATE_LIMIT_MAX_REQUESTS` (default 10). `CORS_ORIGIN` uses a custom allowlist callback — `*` and exact matches are accepted, anything else is rejected with a console warning.

## Migrations

`supabase/migrations/` is ordered `YYYYMMDDhhmmss_*.sql` and run chronologically. They extend the `leads` table (adds `origem`, `ad_origem`, `curva_abc`, `respondeu`, `reuniao_agendada`, `reuniao_concluida`, `proposta_enviada`, `conversao`, `objecao`, plus `faturamento`), create the CRM tables (`crm_stages`, `crm_cards`, `crm_stage_history`) with their triggers, create the metrics tables/views (`metricas_diarias`, `vw_metricas_diarias_calculadas`, `vw_metricas_mensais`, `lead_control_mensal`, `investimento_mensal`), and define the `SECURITY DEFINER` RPCs. `DATABASE.sql` is the legacy single-file schema — for new work, add a dated migration file in `supabase/migrations/`.

## Deployment

`vercel.json` rewrites all traffic to `/api/server`, which re-exports the Express `app`. `src/index.ts` only calls `app.listen` when `NODE_ENV !== 'production'`. Set the same env vars in the Vercel dashboard that are in `.env`. No CI is configured.

## Notes / gotchas

- `BrevoLeadNotificationService` retries 3× with exponential backoff and a 30s timeout — failures are logged with a clear prefix but never propagate. The service warns loudly at startup if any of the four env vars are missing.
- `UserRepository.findByEmail` is noisy on `console.log` — this is intentional during the auth debug session; remove the logs if they get in the way.
- The `users` table is referenced from the application but is provisioned out-of-band — there's no migration file for it. `AUTH_SETUP.sql` (excluded from git) was the original bootstrap.
- `ILead` in `src/domain/entities/Lead.ts` includes a mix of original lead fields and control fields (e.g. `respondeu`, `conversao`). When adding fields, decide whether they belong on `ILead` or on the `LeadControlDTO` — control fields stay on the DTO and are queried via the `LeadControl` use cases, not the base `Lead` use cases.
- The `parseBRCurrency` helper is the single source of truth for "R$ 1.234,56" → number; reuse it instead of writing new parsers.
- Rate limit state lives in a process-local `Map` — on Vercel serverless each invocation may start a fresh bucket, so the limit is best-effort.
