# Worqin — Fase 2 Implementatieplan (Backend)
> Versie 1.0 — 10 maart 2026
> Bronbestanden: PLAN.md, TECH.md, CLAUDE.md, TODO.md

---

## Status Quo — Wat al werkt

### Infrastructuur
- Supabase self-hosted op server01.hjn-media.nl (worqin-app project)
- Database migratie `20260309_initial_schema.sql` toegepast (alle tabellen + RLS + triggers)
- Deploy via `scripts/deploy.sh` + Coolify API
- `scripts/db.sh` voor directe DB toegang

### Auth
- Login: email+password, Google OAuth, Azure OAuth
- Register + email verificatie + wachtwoord vergeten/reset
- Auth callback met auto org+user creation (service role)
- `middleware.ts` beschermt routes en refresht sessie
- Onboarding 5 stappen met server actions

### Data laag
- `lib/supabase/server.ts` + `client.ts` — werkend
- `lib/supabase/queries.ts` — alle read queries met snake->camelCase mapping
- Alle dashboard pages lezen live uit Supabase
- Types in `lib/mock/types.ts` worden door queries.ts gebruikt als interface

### Server Actions (bestaand)
- `app/(auth)/actions.ts` — login, register, forgot/reset password, OAuth, signOut
- `app/onboarding/actions.ts` — saveWelcomeData, createFirstClient, completeOnboarding, startFirstTimer

### Wat NIET bestaat
- Geen CRUD server actions voor time entries, clients, projects, expenses, leave, templates, tasks
- Geen `lib/crypto.ts` (token encryptie)
- Geen API routes (geen `/api/` directory buiten auth callback)
- Geen Google Calendar OAuth flow (agenda lezen)
- Geen Supabase Storage upload flow voor bonnetjes
- Geen `lib/hours-criterion.ts` (business logic)
- Geen `lib/cashflow/forecast.ts` (echte berekening)
- Geen Zod validatie op bestaande server actions

### Technische schuld
- **`getUser()` overal i.p.v. `getClaims()`** — middleware.ts, auth actions, onboarding actions, alle dashboard pages
- **Geen Zod validatie** op bestaande server actions
- **Geen gestandaardiseerde error handling** response types

---

## Architectuurprincipes voor Fase 2

1. **Server Actions voor alle mutaties** — geen API routes tenzij webhook/external callback
2. **API routes alleen voor**: agenda OAuth callback, health check
3. **`getClaims()` overal** — migratie van `getUser()` als eerste taak
4. **Zod schema's per action** — validatie voor alle input
5. **Gestandaardiseerd response type**: `{ success: true, data? } | { error: string }`
6. **`organization_id` altijd uit auth context** — nooit uit request
7. **Helper functie `getAuthContext()`** — herbruikbaar in alle actions

---

## Wat NIET in Fase 2 (verschuift naar Fase 3/4)

| Item | Reden | Fase |
|---|---|---|
| Jortt OAuth koppeling | Vereist Jortt OAuth client registratie | 3 |
| Admin module (admin.worqin.app) | Apart Supabase project, niet blokkerend | 3 |
| Mollie billing | Vereist Mollie account | 3 |
| PDF + CSV export generatie | Frontend mock voldoende, echte generatie na Jortt | 3 |
| Microsoft Outlook Calendar koppeling | Google Calendar eerst, Outlook zelfde patroon | 3 |
| AI: dagstart-briefing, omschrijving genereren | Vereist Anthropic API key + budget | 3 |
| Timer templates CRUD + start | Relatief laag prio, UI werkt met mock | 3 |
| Effectief uurtarief analyse live | Laag prio, kan berekend met bestaande data | 3 |
| Einde-dag samenvatting (cron) | Vereist agenda koppeling + edge function | 3/4 |

---

## Sprint Planning

### Sprint 2.1 — Fundament & Technische Schuld (2 dagen)

**Taak 2.1.1 — Auth helper + getClaims() migratie**
Agent: backend-developer
Wat:
1. Maak `lib/auth.ts` met `getAuthContext()` helper
2. Migreer `middleware.ts`: `getUser()` → `getClaims()`
3. Migreer `app/(auth)/actions.ts`
4. Migreer `app/onboarding/actions.ts`
5. Migreer `app/auth/callback/route.ts`
6. Migreer alle dashboard page.tsx bestanden

**Taak 2.1.2 — Zod validatie + response types**
Agent: backend-developer
Afhankelijk van: 2.1.1
Wat:
1. Maak `lib/validations.ts` met alle Zod schema's
2. Maak `lib/action-utils.ts` met `ActionResult<T>` type + helpers
3. Voeg Zod validatie toe aan bestaande actions

**Taak 2.1.3 — lib/crypto.ts aanmaken**
Agent: backend-developer (parallel met 2.1.1)
Wat:
1. Implementeer AES-256-GCM encrypt/decrypt
2. Configureer `ENCRYPTION_KEY` in `.env.local` en Coolify

---

### Sprint 2.2 — CRUD Actions: Timer, Klanten, Projecten (3 dagen)

**Taak 2.2.1 — Time Entry CRUD actions**
Agent: backend-developer
Wat:
1. `app/(dashboard)/timeline/actions.ts`: startTimer, stopTimer, updateTimeEntry, deleteTimeEntry, createBackdatedEntry, toggleExportReady
2. Duur-afrondingslogica (NONE/MIN_15/MIN_30/MIN_60)
3. Minimum factureerbare minuten (client.minimum_minutes)
4. Max 1 actieve timer per user

**Taak 2.2.2 — Client CRUD actions**
Agent: backend-developer (parallel)
Wat: `app/(dashboard)/customers/actions.ts`: createClient, updateClient, archiveClient, restoreClient, toggleFavorite

**Taak 2.2.3 — Project CRUD actions**
Agent: backend-developer (parallel)
Wat: `app/(dashboard)/customers/[id]/actions.ts`: createProject, updateProject, archiveProject + budgetstatus query

**Taak 2.2.4 — Frontend integratie timer + klanten**
Agent: frontend-developer
Afhankelijk van: 2.2.1 + 2.2.2 + 2.2.3
Wat: Wire alle actions in bestaande componenten, revalidatePath na mutaties

---

### Sprint 2.3 — Onkosten, Verlof, Cashflow, Tasks (2-3 dagen)

**Taak 2.3.1 — Expenses CRUD + Supabase Storage**
Agent: backend-developer
Wat:
1. `app/(dashboard)/expenses/actions.ts`: createExpense, updateExpense, deleteExpense, toggleExportReady
2. `lib/storage.ts`: uploadReceipt, getReceiptUrl, deleteReceipt
3. FormData handling voor file upload

**Taak 2.3.2 — Leave Entry CRUD**
Agent: backend-developer (parallel)
Wat: `app/(dashboard)/financial/leave/actions.ts`: createLeaveEntry, updateLeaveEntry, deleteLeaveEntry

**Taak 2.3.3 — Cashflow Settings action**
Agent: backend-developer (parallel)
Wat: `app/(dashboard)/financial/cashflow/actions.ts`: saveCashflowSettings (upsert) + verbeterde forecast berekening

**Taak 2.3.4 — Tasks CRUD**
Agent: backend-developer (parallel)
Wat: `app/(dashboard)/dashboard/actions.ts`: createTask, toggleTaskComplete, deleteTask

**Taak 2.3.5 — Frontend integratie**
Agent: frontend-developer
Afhankelijk van: 2.3.1-2.3.4
Wat: Wire alle actions in bestaande componenten

---

### Sprint 2.4 — Business Logic + Settings (2 dagen)

**Taak 2.4.1 — 1.225u criterium berekening**
Agent: backend-developer
Wat: `lib/hours-criterion.ts`: calculate1225Progress (direct + indirect + zwangerschapsverlof bonus + projectie)

**Taak 2.4.2 — Compliance berekening**
Agent: backend-developer (parallel)
Wat: `lib/compliance/dba-check.ts`: calculateDBAScore (uren per klant, >70% waarschuwing, indirecte uren check)

**Taak 2.4.3 — Settings CRUD actions**
Agent: backend-developer (parallel)
Wat: `app/(dashboard)/settings/actions.ts`: updateProfile, updateWorkPreferences, updateNotificationSettings, deleteAccount

---

### Sprint 2.5 — Google Calendar Koppeling (3 dagen)

**Taak 2.5.1 — Google Calendar OAuth flow**
Agent: backend-developer
Wat:
1. `app/api/agenda/connect/route.ts` — OAuth URL generatie
2. `app/api/agenda/callback/route.ts` — token exchange + encrypt + opslaan
3. `lib/integrations/google-calendar.ts` — fetchEvents, refreshToken
4. `app/(dashboard)/settings/calendar/actions.ts` — disconnect, sync, filters

**Taak 2.5.2 — Calendar event bevestiging flow**
Agent: backend-developer
Afhankelijk van: 2.5.1
Wat: `app/(dashboard)/calendar/actions.ts`: confirmEvent, bulkConfirmEvents, createTimerFromEvent

**Taak 2.5.3 — Frontend integratie agenda**
Agent: frontend-developer
Afhankelijk van: 2.5.1 + 2.5.2
Wat: Connect knop, sync status, live events, bevestig flow, einde-dag drawer

---

### Sprint 2.6 — RLS Audit + Security + DevOps (2 dagen)

**Taak 2.6.1 — RLS audit**
Agent: security-engineer
Wat: Verifieer RLS op alle tabellen, test cross-org isolatie, fix ontbrekende policies

**Taak 2.6.2 — Security hardening**
Agent: security-engineer (parallel)
Wat: Service role key audit, encryption key audit, rate limiting, CSRF check, org_id uit auth context check

**Taak 2.6.3 — DevOps: auto-deploy + health check**
Agent: devops-engineer (parallel)
Wat:
1. `app/api/health/route.ts` — health endpoint
2. Coolify webhook voor auto-deploy bij push
3. Health check in Coolify configureren

---

## Totaaloverzicht

| Sprint | Dagen | Focus |
|---|---|---|
| 2.1 | 2 | getClaims migratie, Zod, crypto, auth helper |
| 2.2 | 3 | Timer CRUD, Client CRUD, Project CRUD + frontend |
| 2.3 | 2-3 | Expenses + Storage, Leave, Cashflow, Tasks + frontend |
| 2.4 | 2 | 1225u berekening, Compliance, Settings CRUD |
| 2.5 | 3 | Google Calendar OAuth + sync + bevestiging + frontend |
| 2.6 | 2 | RLS audit, security, auto-deploy |
| **Totaal** | **14-16 dagen** | |

---

## Vereisten van de mens (externe acties)

| Actie | Nodig voor sprint |
|---|---|
| `ENCRYPTION_KEY` genereren en in Coolify zetten | 2.1 |
| Google Cloud Console: Calendar API + OAuth credentials (APART van login OAuth) | 2.5 |
| `GOOGLE_CALENDAR_CLIENT_ID` + `SECRET` in Coolify | 2.5 |
