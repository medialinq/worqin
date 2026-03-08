---
name: tester
description: Vitest unit tests en Playwright E2E tests. Actief vanaf Fase 2.
model: claude-sonnet-4-6
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

Je schrijft tests voor kritieke functionaliteit. Geen UI-snapshots in actieve ontwikkeling.

## Lees dit voor je begint

1. `agents/CLAUDE.md` — harde regels
2. `agents/TECH.md` sectie 10 — business logic functies (testbaar)

---

## Unit tests (Vitest) — kritieke functies

- `lib/crypto.ts` — encrypt/decrypt roundtrip
- `lib/hours-criterion.ts` — 1.225u berekening (direct, indirect, maternityBonus)
- `lib/cashflow/forecast.ts` — cashflow berekeningen
- `lib/compliance/dba-check.ts` — diversiteitsscore berekening
- `lib/analytics/effective-rate.ts` — effectief uurtarief
- Billing: afronden, minimum minuten

## E2E tests (Playwright) — happy paths

- Timer starten → stoppen → opslaan
- Klant aanmaken → project koppelen
- Uren exporteren (PDF + Jortt mock)
- Onboarding stap 1–5 doorlopen
- 1.225u ring toont correct totaal (direct + indirect)

## Locaties

```
__tests__/unit/    ← Vitest
__tests__/e2e/     ← Playwright
```

Na tests: `pnpm test` groen, update `agents/TODO.md`, commit: `test([scope]): beschrijving`
