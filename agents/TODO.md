# Worqin — TODO
> Wordt bijgehouden door agents. Bijwerken na elke voltooide taak.
> Bronbestanden: PLAN.md (scope) · TECH.md (techniek) · DESIGN.md (design)

---

## Fase 1 — Pixel-perfect Frontend

### Stap 1 — Fundament
- [ ] Next.js 14 project initialiseren
- [ ] `config/brand.ts` aanmaken (DESIGN.md sectie 1)
- [ ] Tailwind design tokens configureren (DESIGN.md secties 2-4)
- [ ] shadcn/ui installeren + basiscomponenten
- [ ] `app/(dashboard)/layout.tsx` sidebar shell + navigatie
- [ ] Dark/light mode toggle
- [ ] Fonts: Manrope + DM Mono
- [ ] `lib/mock/` aanmaken (alle mock data, zie PLAN.md sectie 6)
- [ ] `messages/nl.json` + `messages/en.json` basisstructuur
- [ ] `public/manifest.json` PWA manifest
- [ ] Code review stap 1

### Stap 2 — Dashboard
- [ ] KPI-kaarten: week-uren, 1.225u ring (uitsplitsing direct/indirect), omzet MTD
- [ ] Actieve timer (groot en prominent)
- [ ] AI-blok (contextgevoelige berichten, dimbaar)
- [ ] Vandaag-kolom: agenda-items + taken
- [ ] Cashflow widget (mock)
- [ ] Recente activiteit (5 entries)
- [ ] Lege state dashboard
- [ ] Code review stap 2

### Stap 3 — Time Tracker + tijdlijn
- [ ] Dagweergave tijdlijn (06:00–23:00)
- [ ] Weekoverzicht (ma–zo)
- [ ] Timer start/stop met klant/project koppeling
- [ ] Type-selector: twee groepen (Klantwerk / Ondernemerswerk)
- [ ] Bij INDIRECT type: klant en project optioneel
- [ ] Timer templates kaarten naast timer (favorieten bovenaan)
- [ ] Terugboeken flow
- [ ] Gap-suggestie in tijdlijn
- [ ] Verlof/ziekte-indicator overlay in tijdlijn (met belastingcontext tooltip)
- [ ] Projectbudget 80% melding
- [ ] Exportklaar markeren
- [ ] AI omschrijving (mock response)
- [ ] Code review stap 3

### Stap 4 — Klanten & Projecten
- [ ] Klantenlijst (actief + gearchiveerd)
- [ ] Klant aanmaken / bewerken (incl. externe koppelingsveld als integratie aan)
- [ ] Klantdetail: uren, omzet, projecten
- [ ] Klantanalyse tab: effectief uurtarief + breakdown donut
- [ ] Projectenlijst per klant
- [ ] Project aanmaken / bewerken
- [ ] Budgetbalk (0%, 50%, 80% alarm, 100%)
- [ ] Favorieten markeren
- [ ] Code review stap 4

### Stap 5 — Agenda
- [ ] Weekoverzicht mock agenda-items
- [ ] Afspraak niet bevestigd (grijs)
- [ ] Afspraak bevestigd als billable / non-billable
- [ ] AI klant-suggestie op afspraak
- [ ] Bevestig flow (één klik)
- [ ] Einde-dag drawer (events zonder timer)
- [ ] Badge op navigatie-icoon bij onbevestigde events
- [ ] Geen agenda gekoppeld — lege state + koppel CTA
- [ ] Token-verloopalarm banner
- [ ] Multi-account weergave (mock: Google + Outlook)
- [ ] Code review stap 5

### Stap 6 — Onkosten & Kilometers
- [ ] Overzichtslijst per kwartaal
- [ ] Bonnetje toevoegen (upload mock)
- [ ] Kilometers registreren
- [ ] Entry bewerken
- [ ] Exportklaar markeren
- [ ] Lege state
- [ ] Code review stap 6

### Stap 7 — Financieel
- [ ] Cashflow: drie maandkaarten met kleurcodering
- [ ] Cashflow: lijndiagram cumulatief saldo (recharts)
- [ ] Cashflow: BTW-momenten als verticale stippellijnen
- [ ] Cashflow: instellingenformulier
- [ ] Verlof/ziekte registratie per dag
- [ ] Verlof: jaaroverzicht (werkdagen / vrij / ziek)
- [ ] Verlof: belastingcontext tooltip per type
- [ ] Code review stap 7

### Stap 8 — Export
- [ ] Periodeselect + klantfilter
- [ ] Overzicht te exporteren items
- [ ] PDF preview (mock rapport)
- [ ] CSV download mock
- [ ] Jortt-exportflow (mock, alleen als integratie aan)
- [ ] Successcherm
- [ ] Foutscherm (PARTIAL)
- [ ] Code review stap 8

### Stap 9 — Instellingen
- [ ] Profiel: naam, avatar, e-mail
- [ ] Werkvoorkeuren: weekdoel, afronden, standaard urentype
- [ ] Notificatie-instellingen per AI-type
- [ ] Agenda-koppelingen (mock states: geen / Google / Outlook / beide)
- [ ] Jortt-koppeling (mock states: niet / gekoppeld / fout)
- [ ] Compliance dashboard: diversiteitscore + bar chart + warnings
- [ ] Timer templates: overzicht + CRUD
- [ ] Abonnement: TRIAL / STARTER / PRO / TEAM
- [ ] Danger zone: account verwijderen
- [ ] Code review stap 9

### Stap 10 — Auth & Onboarding
- [ ] Login: e-mail + Google + Microsoft + foutstates
- [ ] Registratie + e-mailverificatie wachtscherm
- [ ] Wachtwoord vergeten / reset flow
- [ ] Onboarding stap 1–5 met voortgangsbalk
- [ ] Mobiele weergave alle stappen
- [ ] PWA: Apple meta tags in layout.tsx
- [ ] PWA: Timer shortcut (`?action=start-timer`)
- [ ] Code review stap 10

---

## Fase 2 — Backend

- [ ] Supabase projecten aanmaken (worqin-app + worqin-admin)
- [ ] Schema migraties uitvoeren (TECH.md sectie 4)
- [ ] RLS policies verifiëren op alle tabellen
- [ ] `lib/supabase/server.ts` + `client.ts` + `middleware.ts`
- [ ] Types genereren via `supabase gen types`
- [ ] Supabase Auth: e-mail + Google OAuth
- [ ] Onboarding flow end-to-end
- [ ] Time Tracker: start/stop, persisteren, tijdlijn live
- [ ] Klanten + Projecten CRUD
- [ ] 1.225u berekening live (direct + indirect + verlof)
- [ ] Cashflow voorspelling live
- [ ] Google Calendar koppeling
- [ ] Einde-dag samenvatting API
- [ ] Onkosten + kilometers
- [ ] Supabase Storage voor bonnetjes
- [ ] Microsoft OAuth login
- [ ] Security audit (security-engineer)

---

## Fase 3 — Integraties & Admin

- [ ] Jortt OAuth koppeling (export flow)
- [ ] Admin module: klantenoverzicht + detail
- [ ] Admin auth: tweede Supabase project + TOTP 2FA
- [ ] Mollie billing + free trial
- [ ] PDF + CSV export
- [ ] Compliance dashboard live (Wet DBA score)
- [ ] Microsoft Outlook koppeling
- [ ] Timer templates CRUD + start-actie live
- [ ] Effectief uurtarief analyse live
- [ ] AI: dagstart-briefing + omschrijving genereren
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
