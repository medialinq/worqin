# Worqin — Plan van Aanpak
> Bron van waarheid voor scope, features en bouwopdrachten.
> Technische details → zie TECH.md | Design details → zie DESIGN.md
> Versie 2.0 · Maart 2026

---

## 0. Wat is Worqin?

Multi-tenant SaaS werkplek voor Nederlandse ZZP'ers. **Worqin is een zelfstandig systeem** — het werkt volledig zonder externe koppelingen. Integraties (Jortt, Google Calendar, Outlook) zijn opt-in verbindingen die Worqin verrijken, geen vereisten.

Worqin is complementair aan boekhoudpakketten: wij registreren en exporteren, Jortt factureert en doet BTW.

### Wat Worqin WEL doet
- Tijd registreren en koppelen aan klanten en projecten
- Indirecte uren bijhouden (administratie, acquisitie, reistijd, bijscholing)
- 1.225-urencriterium bewaken voor zelfstandigenaftrek
- Agenda lezen (Google + Outlook) en taken/reminders terugschrijven
- Onkosten en kilometers bijhouden
- Urenexport naar Jortt
- Cashflow voorspellen op basis van openstaande uren
- Wet DBA compliance signaleren
- ZZP'ers beheren als bedrijf (admin module)
- AI-assistentie voor patronen, suggesties en omschrijvingen

### Wat Worqin NIET doet
- Facturen aanmaken of versturen
- BTW berekenen of aangifte doen
- Bankrekeningen koppelen
- Boekhoudkundige rapportages maken

### Bedrijfsmodel
- Worqin BV beheert het platform
- ZZP'ers registreren zelf via worqin.app (self-service)
- Worqin-team beheert klanten via admin.worqin.app (aparte module)
- White-label mogelijk via `config/brand.ts` — één bestand, complete rebranding

---

## 1. Kernprincipe — Worqin is het centrale systeem

**"Worqin is een zelfstandig systeem dat je koppelt aan andere systemen."**

Worqin werkt altijd volledig. Elke integratie is een opt-in verrijking.

| Onderdeel | Zonder koppeling | Met koppeling |
|---|---|---|
| Klanten | Volledig beheerd in Worqin | Optioneel gekoppeld aan Jortt/Moneybird |
| Export | PDF + CSV altijd beschikbaar | Extra: direct naar boekhoudpakket |
| Agenda | App werkt volledig | Verrijkt met afspraken |
| AI | Werkt op Worqin-data | Wordt slimmer met agenda-context |

**Regels:**
1. Worqin-data bestaat onafhankelijk — externe ID altijd nullable
2. Extern systeem offline → Worqin werkt gewoon door
3. Integratie verwijderen → externe IDs worden genulld, Worqin-data blijft
4. Wisselen van boekhoudpakket → nieuwe koppeling, zelfde Worqin-data

---

## 2. Modules en Scope

### 2.0 Onboarding (5 stappen, eenmalig)
1. Welkom — naam + bedrijfsnaam
2. Eerste klant aanmaken (verplicht — kan "Overig" zijn)
3. Agenda koppelen — Google of Outlook (overslaanbaar)
4. Jortt koppelen — API-key (overslaanbaar)
5. Eerste timer starten — directe CTA

Na voltooien: `users.onboarded_at` gezet. Flow nooit meer tonen.

---

### 2.1 Dashboard
- KPI-kaarten: week-uren vs doel, 1.225u ring, omzet MTD
- Actieve timer (groot en prominent)
- AI-blok: één kaart, contextgevoelig, dimbaar per dag
- Vandaag-kolom: agenda-items + taken naast elkaar
- Recente activiteit: laatste 5 tijdregistraties
- Cashflow widget: verwachte inkomsten komende 90 dagen
- Snelkoppelingen: configureerbare shortcuts

**AI-signalen (roterend, contextgevoelig):**
- Ochtend: dagstart-briefing + timersuggesties vanuit agenda
- Stilte: nudge na 3u geen actieve timer
- Kwartaaleinde −14 dagen: "exporteer uren naar Jortt"
- Wekelijks: 1.225u projectie op basis van tempo

---

### 2.2 Time Tracker
- Zero friction: timer start met één klik, klant/project optioneel
- Tijdlijn: visuele dagweergave, gaps zichtbaar als suggestie
- Weekoverzicht: ma–zo, dagbalk, weekdoel voortgang
- Verlof/ziekte-indicators in tijdlijn (gekleurde overlay per dag)

**Urentypes — twee groepen:**

Klantwerk (directe uren):
- BILLABLE — declarabel klantwerk
- NON_BILLABLE — klantwerk niet declarabel
- PRO_BONO — gratis klantwerk

Ondernemerswerk (indirecte uren — tellen mee voor 1.225u):
- INDIRECT_ADMIN — administratie, BTW-aangifte, boekhouding
- INDIRECT_SALES — acquisitie, offertes, netwerken
- INDIRECT_TRAVEL — reistijd naar zakelijke afspraken
- INDIRECT_LEARNING — bijscholing, cursussen, vakgerelateerde lectuur
- INDIRECT_OTHER — overig ondernemerswerk

Bij INDIRECT-types: klant en project zijn **optioneel** (nooit verplicht).

**Overige features:**
- Tariefkoppeling: omzetberekening direct bij stoppen
- Exportklaar markeren: bewuste actie vóór Jortt-export
- Afronden op kwartier: opt-in per gebruiker
- Terugboeken: tijdstip in verleden invoeren
- Projectbudget: melding bij 80% bereikt
- Timer templates: één klik om terugkerende werkzaamheden te starten

**AI:**
- Omschrijving genereren bij stoppen
- Projectherkenning via agenda (zelfde tijdvak)
- Vergeten-urenmelding: agenda-afspraak zonder timer
- Dagpatroon herkenning

---

### 2.3 Agenda
**Lezen (Google + Outlook):**
- Multi-account: meerdere accounts per gebruiker
- Kalender-selectie: per account instellen welke zichtbaar zijn
- Filterregels: trefwoorden overslaan of altijd factureerbaar markeren
- Privacy-modus: kalenders nooit tonen in Worqin
- Token-verloopalarm: 7 dagen van tevoren

**Schrijven (alleen taken/reminders):**
- Taak aanmaken in Worqin → wegschrijven naar Google/Outlook
- NOOIT tijdregistraties terugschrijven naar agenda

**Einde-dag samenvatting:**
- Om 17:00 (instelbaar): detecteer agenda-events zonder gekoppelde timer
- Slide-in drawer met bulk-bevestigingsoptie
- Badge op navigatie-icoon als er onbevestigde events zijn

**AI:**
- Klantherkenning in afspraaktitels (zelflerende mapping)
- Billable/non-billable classificatie
- Dagvoorbereiding: prognose gefactureerde uren
- Reistijdherkenning
- Terugkerende afspraken auto-classificeren (na 3x bevestiging)

Bevestigen: altijd per afspraak, één klik — NOOIT automatisch boeken.

---

### 2.4 Klanten & Projecten
**Klanten:**
- Naam, e-mail, kleur, uurtarief, kilometertarief, minimum factureerbare minuten
- Actief/inactief (archiveren, nooit verwijderen)
- Favoriet markeren (bovenaan in timer-dropdown)
- Externe koppeling: jorttId, moneybirdId (nullable, handmatig koppelen)
- Klantanalyse: effectief uurtarief t.o.v. gedeclareerd tarief

**Projecten:**
- Naam, klant, omschrijving, budgeturen, eigen uurtarief (overschrijft klanttarief)
- Actief/inactief
- Budgetalarm bij 80% bereikt

---

### 2.5 Onkosten & Kilometers
- Bonnetje uploaden: foto/pdf → Supabase Storage
- Kilometerregistratie: datum, van/naar, km, type
- BTW-percentage opslaan — Worqin berekent NIETS
- Exportklaar markeren voor Jortt
- Kwartaaloverzicht ter voorbereiding op Jortt-aangifte

---

### 2.6 Export naar Jortt
**Flow:**
1. Gebruiker kiest periode
2. Overzicht exportklare entries (declarabele uren + onkosten)
3. Bevestigen
4. Jortt API-call per klant
5. `exported_at` zetten op verwerkte entries
6. ExportLog aanmaken
7. Bevestigingsscherm + deeplink naar Jortt

**Regels:**
- Alleen entries met `is_export_ready = true`
- Al geëxporteerde entries (`exported_at != null`) kunnen niet opnieuw
- Gedeeltelijke export wordt gelogd als PARTIAL

**Zonder Jortt-koppeling:** alleen PDF + CSV download — geen Jortt-optie.

---

### 2.7 Financieel

#### Cashflow Voorspelling (90 dagen)
- Openstaande uren × tarief = verwachte omzet per maand
- Vaste lasten en belastingreservering aftrekken
- BTW-afdracht momenten markeren in grafiek
- Kleurcodering saldo: groen (boven buffer), oranje (boven nul, onder buffer), rood (negatief)
- Dashboard-widget: verwachte cashflow samenvatting

Instellingen (per organisatie):
- Maandelijkse vaste lasten
- Belastingreservering percentage (default: 30%)
- Huidig saldo
- Veiligheidsbuffer (default: €5.000)
- BTW-frequentie: maandelijks / kwartaal / jaarlijks

#### Verlof & Ziekte
- Registreren per dag: vakantie, ziekte, zwangerschapsverlof, feestdag, overig
- Vakantie en ziekte tellen NIET mee voor 1.225u criterium
- Zwangerschapsverlof telt WEL mee (max 16 weken × weekdoel-uren)
- Verlof/ziekte-indicators in tijdlijn (gekleurde overlay per dag)
- Tooltip: legt belastingcontext uit per type
- Jaaroverzicht: werkdagen / vrije dagen / ziektedagen

---

### 2.8 Compliance — Wet DBA Dashboard
Route: `/instellingen/compliance`

- Diversiteitscore: LAAG / GEMIDDELD / GOED
- Horizontal bar chart: uren per opdrachtgever (laatste 90 dagen, instelbaar)
- Waarschuwing bij > 70% uren bij één klant
- Waarschuwing bij geen indirecte uren geregistreerd
- Periodefilter: 30 / 60 / 90 / 180 / 365 dagen
- Download "Klaar voor controle" PDF voor Belastingdienst

Score berekening:
- GOED: grootste klant < 50% én ≥ 3 actieve klanten
- GEMIDDELD: grootste klant 50–70% of < 3 actieve klanten
- LAAG: grootste klant > 70% of slechts 1 actieve klant

---

### 2.9 Timer Templates
Route: `/instellingen/templates`

- Templates aanmaken met: naam, klant (optioneel), project (optioneel), type, standaard duur
- Eén klik start direct een lopende timer met pre-filled waarden
- Favorieten bovenaan, daarna gesorteerd op gebruikstelling
- CRUD-beheer in instellingen
- Templates zijn per gebruiker (niet per organisatie)

---

### 2.10 Taken
- Taak aanmaken: titel, vervaldatum, klant/project koppeling
- Taak wegschrijven naar Google Calendar of Outlook (als reminder/event)
- Taak voltooien
- Overzicht op dashboard (vandaag-kolom)

---

### 2.11 Instellingen
- Profiel: naam, avatar, e-mail
- Werkvoorkeuren: weekdoel, afrondingsinterval, standaard urentype
- Notificaties: per AI-nudge type in/uitschakelen, tijdvenster
- Agenda-koppelingen (zie 2.3)
- Jortt-koppeling: OAuth-flow + verbindingstest
- Compliance dashboard (zie 2.8)
- Timer templates (zie 2.9)
- Abonnement: plan + upgrade (deeplink Mollie)
- Danger zone: account verwijderen (soft-delete 30 dagen)

---

### 2.12 Admin Module (admin.worqin.app)
Toegang: aparte Supabase-instantie, invite-only, TOTP 2FA verplicht.

**Klantenoverzicht:**
- Alle organisaties: naam, plan, aanmaakdatum, laatste activiteit
- Filteren op plan/status, zoeken

**Klantdetail:**
- Gebruikers in de organisatie
- Abonnementsinfo + Mollie koppeling
- Exportlogs
- Plan handmatig wijzigen
- Impersoneren voor support (audit-logged)
- Account deactiveren

**Overig:**
- Subscripties: Mollie-overzicht, MRR, churn
- Analytics: actieve gebruikers, feature-gebruik
- Audit-log: alle admin-acties

---

## 3. Auth Architectuur

### Twee gescheiden auth-systemen

```
worqin.app       → Supabase Auth — ZZP-gebruikers (self-service)
admin.worqin.app → Supabase Auth (aparte instantie) — Worqin-medewerkers (invite-only + TOTP 2FA)
```

Sessies mogen nooit overlappen. Aparte Supabase-projecten = aparte JWT secrets, aparte `auth.users` tabellen.

### ZZP-gebruikers
- E-mail + wachtwoord
- Google OAuth
- Microsoft OAuth (MicrosoftEntraId, tenantId: 'common')

### Admin-medewerkers
- E-mail + wachtwoord + verplichte TOTP 2FA
- Aanmaken: alleen via seed script of SUPER_ADMIN
- Nooit self-service

**Admin rollen:**

| Actie | SUPER_ADMIN | SUPPORT | BILLING |
|---|---|---|---|
| Admins aanmaken | ✓ | ✗ | ✗ |
| Klant deactiveren | ✓ | ✗ | ✗ |
| Klant impersoneren | ✓ | ✓ | ✗ |
| Plan handmatig wijzigen | ✓ | ✓ | ✗ |
| Klantdata inzien | ✓ | ✓ | ✗ |
| Subscripties + MRR | ✓ | ✗ | ✓ |
| Audit-log | ✓ | ✗ | ✗ |

---

## 4. Billing — Mollie

| Plan | Prijs | Limieten |
|---|---|---|
| TRIAL | €0 / 14 dagen | Alle features |
| STARTER | €7/mnd | Timer + 1 koppeling + 3 klanten |
| PRO | €14/mnd | Alles + AI |
| TEAM | €25/mnd | Pro + 5 gebruikers |

Jaarabonnement: 10 maanden betalen, 12 krijgen.

Webhook events:
- `subscription.charged` → plan actief houden
- `subscription.canceled` → downgraden na einde periode
- `payment.failed` → notificeren, 7 dagen grace

---

## 5. Gefaseerde Roadmap

### Fase 1 — Pixel-perfect Frontend (mock data, geen API calls)
**Doel:** alle schermen werken, alle states zichtbaar — geen echte data

Volgorde:

**Stap 1 — Fundament**
- Next.js 14 setup + `config/brand.ts` + Tailwind design tokens
- shadcn/ui installeren + basiscomponenten
- Sidebar shell + navigatiestructuur
- Dark/light mode toggle
- Fonts laden (Manrope + DM Mono)
- Mock data aanmaken in `lib/mock/`
- `messages/nl.json` basisstructuur

**Stap 2 — Dashboard**
- KPI-kaarten: week-uren, 1.225u ring (met uitsplitsing direct/indirect), omzet MTD
- Actieve timer (groot en prominent)
- AI-blok (verschillende contextgevoelige berichten)
- Vandaag-kolom: agenda-items + taken
- Cashflow widget (mock)
- Recente activiteit

**Stap 3 — Time Tracker + tijdlijn**
- Dagweergave tijdlijn (06:00–23:00)
- Weekoverzicht (ma–zo)
- Timer start/stop met klant/project koppeling
- Type-selector: twee groepen (Klantwerk / Ondernemerswerk)
- Bij INDIRECT type: klant en project optioneel
- Timer templates kaarten naast de timer
- Terugboeken flow
- Gap-suggestie in tijdlijn
- Verlof/ziekte-indicator in tijdlijn (gekleurde overlay)
- AI omschrijving (mock)

**Stap 4 — Klanten & Projecten**
- Klantenlijst + klantdetail
- Klant aanmaken/bewerken
- Klantanalyse tab: effectief uurtarief + breakdown donut
- Projectenlijst + budgetbalk
- Favorieten markeren

**Stap 5 — Agenda**
- Weekoverzicht mock agenda-items
- Bevestig flow (één klik per afspraak)
- Einde-dag drawer (mock: events zonder timer)
- Koppeling states: geen / Google / Outlook / beide
- Token-verloopalarm banner

**Stap 6 — Onkosten & Kilometers**
- Overzichtslijst per kwartaal
- Bonnetje toevoegen + kilometers registreren
- Exportklaar markeren

**Stap 7 — Financieel**
- Cashflow voorspelling: drie maandkaarten + lijndiagram
- BTW-momenten zichtbaar in grafiek
- Instellingenformulier cashflow
- Verlof/ziekte registratie + jaaroverzicht
- Verloftype-selector met belastingcontext tooltip

**Stap 8 — Export**
- Periodeselect + klantfilter
- Overzicht te exporteren items
- PDF preview (mock rapport)
- Jortt-exportflow (mock, alleen als integratie aan)
- Succes- en foutstaat

**Stap 9 — Instellingen**
- Profiel + werkvoorkeuren
- Notificatie-instellingen
- Agenda-koppelingen (mock states)
- Jortt-koppeling (mock states)
- Compliance dashboard: diversiteitscore + bar chart + warnings
- Timer templates: overzicht + aanmaken/bewerken
- Abonnement

**Stap 10 — Login, Registratie & Onboarding**
- Login: e-mail + Google + Microsoft + foutstates
- Registratie + e-mailverificatie
- Wachtwoord vergeten/reset
- Onboarding 5 stappen met voortgangsbalk
- PWA manifest + Apple meta tags

**Fase 1 Definition of Done:**
- Alle 10 stappen volledig uitgewerkt
- Alle states aanwezig: gevuld, leeg, laden, fout
- Responsive: 1280px desktop + 390px mobiel
- Dark mode + light mode pixel-perfect
- Navigatie tussen alle schermen werkt
- Geen TypeScript errors, geen hardcoded strings
- `BRAND.name` gebruikt, nooit "Worqin" hardcoded
- PWA manifest aanwezig en geldig

---

### Fase 2 — Backend (echte data, auth, API)
**Doel:** frontend draait op echte Supabase data, auth werkt

- Supabase project opzetten (schema + RLS + migraties)
- `lib/supabase/server.ts` + `client.ts` + middleware
- Authenticatie: e-mail + Google OAuth (Supabase Auth)
- Onboarding flow end-to-end
- Time Tracker: echte start/stop, persisteren, tijdlijn
- Klanten + Projecten CRUD
- 1.225u berekening live (inclusief indirecte uren + verlof)
- Cashflow voorspelling live
- Google Calendar koppeling (lezen + einde-dag samenvatting)
- Onkosten + kilometers module
- Microsoft OAuth login
- Supabase Storage voor bonnetjes

---

### Fase 3 — Integraties & Admin
**Doel:** Jortt koppeling live, admin.worqin.app werkt

- Jortt OAuth koppeling (export flow end-to-end)
- Admin module: klantenoverzicht + klantdetail
- Admin auth: Supabase tweede project + TOTP 2FA
- Mollie billing + free trial
- PDF + CSV export
- Compliance dashboard live
- Microsoft Outlook koppeling
- Wet DBA compliance score live
- Timer templates (CRUD + start vanuit template)
- Effectief uurtarief analyse per klant
- AI: dagstart-briefing + omschrijving genereren
- AI: projectherkenning + billable classificatie

---

### Fase 4 — AI, Groei & Stabilisatie
- AI: weekgap-analyse + reistijdherkenning
- AI: zelflerende klantmapping + patronen
- Einde-dag samenvatting volledig live
- Admin: subscripties + MRR overzicht
- Moneybird koppeling
- Referral systeem
- White-label eerste externe klant
- Team-tier functionaliteit

---

## 6. Mock Data Structuur

```typescript
// lib/mock/index.ts — centrale export
export { mockUser, mockOrganization } from './user'
export { mockClients, mockProjects } from './clients'
export { mockTimeEntries, mockActiveTimer, mockTimerTemplates } from './timer'
export { mockCalendarEvents, mockEndOfDaySummary } from './agenda'
export { mockExpenses } from './expenses'
export { mockDashboardStats } from './dashboard'
export { mockCashflowForecast } from './cashflow'
export { mockDBAReport } from './compliance'
export { mockLeaveEntries } from './leave'
```

Realistische scenario's in mock data:
- 3 klanten, 7 projecten, 1 project op 82% van budget
- Huidige week: 28u van 36u weekdoel
- 1.225u tracker: 847u direct + 38u indirect = 885u (72%)
- Actieve timer: 1u 34m geleden gestart
- 2 agenda-afspraken vandaag zonder gekoppelde timer
- DBA score: GEMIDDELD (67% bij Acme BV)
- Cashflow saldo komende 90 dagen: positief boven buffer
- 4 timer templates (2 favorieten)
- Jortt-integratie actief (voor mock states)

---

## 7. Harde Product-Regels

1. **`organization_id` in elke DB query** — via RLS afgedwongen, ook expliciet in queries
2. **`BRAND.name` in componenten** — nooit "Worqin" hardcoded
3. **Externe OAuth tokens encrypted** — `lib/crypto.ts` voor agenda/Jortt tokens
4. **Supabase Auth ≠ Agenda OAuth** — aparte flows, aparte opslag
5. **Worqin schrijft GEEN tijdregistraties naar agenda** — alleen taken/reminders
6. **BTW niet berekenen** — percentage opslaan, Jortt berekent
7. **Geen facturen aanmaken** — exporteren naar Jortt, Jortt factureert
8. **Admin ≠ App** — aparte Supabase-projecten, nooit mengen
9. **`getClaims()` in server code** — nooit `getSession()`
10. **Worqin is bron van waarheid** — externe IDs (jorttId etc.) altijd nullable
11. **INDIRECT-types nooit verplicht koppelen aan klant/project** — optioneel
12. **LeaveEntry.date is DATE** — geen TIMESTAMP, geen tijdzone-problemen
13. **CashflowSettings is 1-op-1 met Organization** — niet per user
14. **Timer templates zijn per user** — niet per organization

---

## 8. Openstaande Acties (jouw acties, buiten code om)

| Actie | Status |
|---|---|
| `worqin.app` domein registreren | 🔴 Actie vereist |
| Jortt: e-mail naar support@jortt.nl — registreer Worqin als OAuth-client | 🔴 E-mail sturen |
| Mollie account aanmaken | 🔴 Actie vereist |
| Coolify installeren op VPS | 🟡 VPS beschikbaar |
| Google Cloud Console — calendar scopes toevoegen | 🟡 Actie vereist |
| Anthropic API — budget-limiet instellen (aanbevolen: €50/mnd) | 🟡 Actie vereist |
| Resend account aanmaken (na domeinregistratie) | 🔴 Actie vereist |
| Azure App Registration aanmaken (fase 2, niet blokkerend) | 🟢 Gepland fase 2 |
| Twee Supabase projecten aanmaken (worqin-app + worqin-admin) | 🔴 Actie vereist |

**Jortt OAuth details:**
- Redirect URL: `https://worqin.app/api/jortt/callback`
- Scopes: `customers:read organizations:read`
- Tokens verlopen na 2 uur — refresh-flow verplicht bouwen

---

## 9. Concurrentiepositie

### Wat TrackFlow heeft dat Worqin ook heeft
Klanten, projecten, tijdlijn, timers, afronden, tarieven, rapportages, kilometerregistratie.

### Wat Worqin EXTRA heeft (onderscheidend)
- Agenda-koppeling (Google + Outlook): lezen + taken schrijven
- Indirecte uren registratie (5 subcategorieën)
- 1.225-urencriterium bewaker (direct + indirect + zwangerschapsverlof)
- Wet DBA compliance dashboard — uniek in NL
- Cashflow voorspelling gekoppeld aan openstaande uren
- Effectief uurtarief analyse per klant
- Timer templates voor terugkerende werkzaamheden
- Einde-dag agenda samenvatting
- Verlof en ziekteregistratie (met belastingcontext)
- Jortt OAuth-koppeling (directe export)
- AI-assistentie
- Multi-tenancy + admin module
- White-label architectuur
- PWA (installeerbaar op telefoon)

### Wat TrackFlow heeft dat Worqin bewust NIET heeft
- Offline-first / lokale opslag → Worqin is cloud-first SaaS
- Desktop app → web-first, PWA eventueel later
- Factuurberekeningen → complementair model, Jortt factureert
