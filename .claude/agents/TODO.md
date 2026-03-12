# Worqin — TODO
> Wordt bijgehouden door agents. Bijwerken na elke voltooide taak.
> Bronbestanden: PLAN.md (scope) · TECH.md (techniek) · DESIGN.md (design)

---

## Fase 1 — Pixel-perfect Frontend

### Stap 1 — Fundament ✅
- [x] Next.js 14 project initialiseren
- [x] `config/brand.ts` aanmaken (DESIGN.md sectie 1)
- [x] Tailwind design tokens configureren (DESIGN.md secties 2-4)
- [x] shadcn/ui installeren + basiscomponenten
- [x] `app/(dashboard)/layout.tsx` sidebar shell + navigatie
- [x] Dark/light mode toggle
- [x] Fonts: Manrope + DM Mono
- [x] `lib/mock/` aanmaken (alle mock data, zie PLAN.md sectie 6)
- [x] `messages/nl.json` + `messages/en.json` basisstructuur
- [x] `public/manifest.json` PWA manifest
- [x] Code review stap 1

### Stap 2 — Dashboard ✅
- [x] KPI-kaarten: week-uren, 1.225u ring (uitsplitsing direct/indirect), omzet MTD
- [x] Actieve timer (groot en prominent)
- [x] AI-blok (contextgevoelige berichten, dimbaar)
- [x] Vandaag-kolom: agenda-items + taken
- [x] Cashflow widget (mock)
- [x] Recente activiteit (5 entries)
- [x] Lege state dashboard
- [x] Code review stap 2

### Stap 3 — Time Tracker + tijdlijn ✅
- [x] Dagweergave tijdlijn (06:00–23:00)
- [x] Weekoverzicht (ma–zo)
- [x] Timer start/stop met klant/project koppeling
- [x] Type-selector: twee groepen (Klantwerk / Ondernemerswerk)
- [x] Bij INDIRECT type: klant en project optioneel
- [x] Timer templates kaarten naast timer (favorieten bovenaan)
- [x] Terugboeken flow
- [x] Gap-suggestie in tijdlijn
- [x] Verlof/ziekte-indicator overlay in tijdlijn (met belastingcontext tooltip)
- [x] Projectbudget 80% melding
- [x] Exportklaar markeren
- [x] AI omschrijving (mock response)
- [x] Code review stap 3

### Stap 4 — Klanten & Projecten ✅
- [x] Klantenlijst (actief + gearchiveerd)
- [x] Klant aanmaken / bewerken (incl. externe koppelingsveld als integratie aan)
- [x] Klantdetail: uren, omzet, projecten
- [x] Klantanalyse tab: effectief uurtarief + breakdown donut
- [x] Projectenlijst per klant
- [x] Project aanmaken / bewerken
- [x] Budgetbalk (0%, 50%, 80% alarm, 100%)
- [x] Favorieten markeren
- [x] Code review stap 4

### Stap 5 — Agenda ✅
- [x] Weekoverzicht mock agenda-items
- [x] Afspraak niet bevestigd (grijs)
- [x] Afspraak bevestigd als billable / non-billable
- [x] AI klant-suggestie op afspraak
- [x] Bevestig flow (één klik)
- [x] Einde-dag drawer (events zonder timer)
- [x] Badge op navigatie-icoon bij onbevestigde events
- [x] Geen agenda gekoppeld — lege state + koppel CTA
- [x] Token-verloopalarm banner
- [x] Multi-account weergave (mock: Google + Outlook)
- [x] Code review stap 5

### Stap 6 — Onkosten & Kilometers ✅
- [x] Overzichtslijst per kwartaal
- [x] Bonnetje toevoegen (upload mock)
- [x] Kilometers registreren
- [x] Entry bewerken
- [x] Exportklaar markeren
- [x] Lege state
- [x] Code review stap 6

### Stap 7 — Financieel ✅
- [x] Cashflow: drie maandkaarten met kleurcodering
- [x] Cashflow: lijndiagram cumulatief saldo (recharts)
- [x] Cashflow: BTW-momenten als verticale stippellijnen
- [x] Cashflow: instellingenformulier
- [x] Verlof/ziekte registratie per dag
- [x] Verlof: jaaroverzicht (werkdagen / vrij / ziek)
- [x] Verlof: belastingcontext tooltip per type
- [x] Code review stap 7

### Stap 8 — Export ✅
- [x] Periodeselect + klantfilter
- [x] Overzicht te exporteren items
- [x] PDF preview (mock rapport)
- [x] CSV download mock
- [x] Jortt-exportflow (mock, alleen als integratie aan)
- [x] Successcherm
- [x] Foutscherm (PARTIAL)
- [x] Code review stap 8

### Stap 9 — Instellingen ✅
- [x] Profiel: naam, avatar, e-mail
- [x] Werkvoorkeuren: weekdoel, afronden, standaard urentype
- [x] Notificatie-instellingen per AI-type
- [x] Agenda-koppelingen (mock states: geen / Google / Outlook / beide)
- [x] Jortt-koppeling (mock states: niet / gekoppeld / fout)
- [x] Compliance dashboard: diversiteitscore + bar chart + warnings
- [x] Timer templates: overzicht + CRUD
- [x] Abonnement: TRIAL / STARTER / PRO / TEAM
- [x] Danger zone: account verwijderen
- [x] Code review stap 9

### Stap 10 — Auth & Onboarding ✅
- [x] Login: e-mail + Google + Microsoft + foutstates
- [x] Registratie + e-mailverificatie wachtscherm
- [x] Wachtwoord vergeten / reset flow
- [x] Onboarding stap 1–5 met voortgangsbalk
- [x] Mobiele weergave alle stappen
- [x] PWA: Apple meta tags in layout.tsx
- [x] PWA: Timer shortcut (`?action=start-timer`)
- [x] Code review stap 10

---

## Fase 2 — Backend ✅

- [x] Supabase projecten aanmaken (worqin-app + worqin-admin)
- [x] Schema migraties uitvoeren (TECH.md sectie 4)
- [x] RLS policies verifiëren op alle tabellen
- [x] `lib/supabase/server.ts` + `client.ts` + `middleware.ts`
- [x] Types genereren via `supabase gen types`
- [x] Supabase Auth: e-mail + Google OAuth
- [x] Onboarding flow end-to-end
- [x] Time Tracker: start/stop, persisteren, tijdlijn live
- [x] Klanten + Projecten CRUD
- [x] 1.225u berekening live (direct + indirect + verlof)
- [x] Cashflow voorspelling live
- [x] Google Calendar koppeling
- [x] Einde-dag samenvatting API
- [x] Onkosten + kilometers
- [x] Supabase Storage voor bonnetjes
- [x] Microsoft OAuth login
- [x] Security audit (security-engineer)

---

## Fase 3 — Integraties & Admin

- [ ] Jortt OAuth koppeling (export flow)
- [x] Admin module: klantenoverzicht + detail + plan management
- [ ] Admin auth: tweede Supabase project + TOTP 2FA
- [ ] Mollie billing + free trial
- [x] PDF + CSV export (real PDF via print, CSV download)
- [ ] Compliance dashboard live (Wet DBA score)
- [ ] Microsoft Outlook koppeling
- [x] Timer templates CRUD + start-actie live
- [ ] Effectief uurtarief analyse live
- [x] AI: dagstart-briefing + omschrijving genereren
- [ ] AI: projectherkenning + billable classificatie
- [ ] Security audit voor launch

---

## Fase 4 — AI & Groei

- [ ] AI: weekgap-analyse + reistijdherkenning
- [ ] AI: zelflerende klantmapping
- [ ] Einde-dag samenvatting volledig live
- [ ] Admin: subscripties + MRR
- [ ] Moneybird koppeling
- [ ] Team-tier functionaliteit
- [ ] White-label eerste externe klant
