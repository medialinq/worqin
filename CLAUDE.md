# Worqin — CLAUDE.md
> Globale instructies voor alle agents. Lees dit ALTIJD als eerste.
> Drie bronbestanden: PLAN.md (wat & waarom) · TECH.md (hoe) · DESIGN.md (look & feel)

---

## Wat is Worqin?

Multi-tenant SaaS werkplek voor Nederlandse ZZP'ers. Worqin is een **zelfstandig systeem** — het werkt volledig zonder externe koppelingen. Integraties (Jortt, Google Calendar, Outlook) zijn opt-in verbindingen die Worqin verrijken, geen vereisten.

---

## Drie bronbestanden

| Bestand | Bevat | Lezen wanneer |
|---|---|---|
| `.claude/agents/PLAN.md` | Productscope, features, roadmap, bouwopdrachten | Altijd als eerste bij een nieuwe taak |
| `.claude/agents/TECH.md` | Stack, Supabase patronen, schema, API-patronen | Bij elke backend, database of auth taak |
| `.claude/agents/DESIGN.md` | Kleuren, typografie, componenten, layout | Bij elke frontend of UI taak |

---

## Tech Stack (samenvatting)

| Laag | Keuze |
|---|---|
| Frontend | Next.js 14 App Router |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Auth | Supabase (twee aparte projecten) |
| Storage | Supabase Storage |
| Betalingen | Mollie |
| E-mail | Resend |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| i18n | next-intl (browsertaal detectie, fallback NL) |
| Hosting | Coolify op eigen VPS |
| CI/CD | GitHub Actions |

---

## Supabase architectuur

### Twee aparte projecten — NOOIT mengen

```
worqin-app    → worqin.app         (ZZP-gebruikers)
worqin-admin  → admin.worqin.app   (Worqin-medewerkers, TOTP 2FA verplicht)
```

### Verplicht client patroon

```typescript
// Server Components, API routes, Server Actions:
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Components:
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Auth regel (kritiek)

```typescript
// ✅ ALTIJD getClaims() in server code
const { data: { user } } = await supabase.auth.getClaims()
if (!user) redirect('/login')

// ❌ NOOIT getSession()
```

### RLS op elke tabel

```sql
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON time_entries
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );
```

---

## Projectstructuur

```
worqin/
├── config/brand.ts           ← WHITE-LABEL: ENIGE plek voor merkidentiteit
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (dashboard)/          ← beschermde ZZP-app
│   ├── (admin)/              ← admin.worqin.app
│   └── api/
├── components/
│   ├── ui/                   ← shadcn/ui (NOOIT aanpassen)
│   └── [feature]/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts          ← gegenereerd via `supabase gen types`
│   ├── crypto.ts             ← AES-256-GCM voor externe tokens
│   ├── ai.ts
│   ├── hours-criterion.ts
│   ├── cashflow/
│   ├── compliance/
│   ├── analytics/
│   └── integrations/
├── lib/mock/                 ← Fase 1 only
├── messages/nl.json + en.json
├── middleware.ts
├── supabase/migrations/
└── .claude/agents/
```

---

## Harde regels — nooit van afwijken

1. **`organization_id` in elke DB query** — RLS dwingt dit af, maar wees ook expliciet
2. **`BRAND.name` in componenten** — nooit `"Worqin"` hardcoded
3. **Externe OAuth tokens encrypted** — altijd via `lib/crypto.ts`
4. **Supabase Auth ≠ Agenda OAuth** — aparte flows, aparte opslag, nooit mengen
5. **Geen tijdregistraties naar agenda** — alleen taken/reminders schrijven
6. **BTW niet berekenen** — percentage opslaan, Jortt berekent
7. **Geen facturen aanmaken** — exporteren naar Jortt, Jortt factureert
8. **Admin ≠ App Supabase project** — volledig gescheiden
9. **`getClaims()` in server code** — nooit `getSession()`
10. **Worqin is bron van waarheid** — externe IDs altijd nullable
11. **INDIRECT-types nooit verplicht koppelen aan klant/project**
12. **`LeaveEntry.date` is DATE** — geen TIMESTAMP
13. **CashflowSettings is 1-op-1 met Organization** — niet per user
14. **Timer templates zijn per user** — niet per organization

---

## Conventies

- **Taal in code:** Engels
- **Taal in communicatie met mens:** Nederlands
- **Commit messages:** Engels, Conventional Commits
- **`'use client'`** alleen wanneer écht nodig — default = Server Component
- **UI-teksten** via `next-intl` — geen hardcoded strings
- **Merknaam** altijd via `BRAND.name` uit `config/brand.ts`

---

## Werkwijze

- **Minimale wijzigingen** — wijzig alleen wat direct nodig is
- **Niet gokken** — lees bestaande code voor je iets wijzigt
- **Niet overcompliceren** — geen abstracties voor eenmalige operaties
- **Scope** — doe exact wat gevraagd wordt, niet meer
- **Debugging** — lees fout → lees code → trace → fix één ding

---

## TODO bijhouden

Na elke voltooide taak: update `.claude/agents/TODO.md` (zet `[ ]` op `[x]`).

---

## Commit formaat

```
feat(timer):      nieuwe functionaliteit
fix(agenda):      bugfix
security(auth):   security wijziging
refactor(db):     verbetering zonder gedragswijziging
docs:             documentatie
test(export):     tests
chore(deps):      dependencies
```
