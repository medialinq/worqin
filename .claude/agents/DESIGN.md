# Worqin — Design Systeem
> Alle visuele en UX beslissingen staan hier. Los van technologie.
> Agents lezen dit voor elk frontend-onderdeel.
> Versie 2.0 · Maart 2026

---

## 1. Merkidentiteit

```typescript
// config/brand.ts — ENIGE plek voor merkidentiteit
// Nooit "Worqin" hardcoded in componenten — altijd BRAND.name
export const BRAND = {
  name:         "Worqin",
  tagline:      "De slimme werkplek voor ZZP'ers",
  url:          "https://worqin.app",
  supportEmail: "hello@worqin.app",
  accent:       "#3D52D5",
  accentLight:  "#5068E8",
  logo:         "/brand/logo.svg",
  favicon:      "/brand/favicon.ico",
  fonts: {
    display: "Manrope",
    mono:    "DM Mono",
  },
} as const
```

White-label klant = eigen `config/brand.ts` + eigen `/public/brand/` map. Eén bestand, complete rebranding.

---

## 2. Kleurpalet

### Accentkleur
- Primair: `#3D52D5` — knoppen, actieve states, links, focus rings
- Licht: `#5068E8` — hover states op primaire knop
- **Nooit aanpassen voor dark/light mode** — accent is altijd hetzelfde

### Achtergronden
| | Light | Dark |
|---|---|---|
| App-achtergrond | `#F4F3EF` (warm off-white) | `#111110` (warm near-black) |
| Surface (kaarten) | `#FFFFFF` | `#1C1C1A` |
| Surface verhoogd | `#F7F7F5` | `#242422` |
| Border | `#E5E4E0` | `#2E2E2C` |

### Semantische kleuren
- Succes: `#22C55E`
- Waarschuwing: `#F59E0B`
- Fout: `#EF4444`
- Info: `#3B82F6`

### Status-kleuren urentypes
| Type | Kleur | Gebruik |
|---|---|---|
| BILLABLE | `#3D52D5` (accent) | Declarabele klanturen |
| NON_BILLABLE | `#94A3B8` (slate-400) | Niet-declarabel klantwerk |
| PRO_BONO | `#22C55E` (groen) | Gratis klantwerk |
| INDIRECT_ADMIN | `#F59E0B` (amber) | Administratie |
| INDIRECT_SALES | `#8B5CF6` (violet) | Acquisitie |
| INDIRECT_TRAVEL | `#06B6D4` (cyan) | Reistijd |
| INDIRECT_LEARNING | `#EC4899` (pink) | Bijscholing |
| INDIRECT_OTHER | `#6B7280` (gray) | Overig indirect |

### Verlofkleuren (tijdlijn)
| Type | Kleur |
|---|---|
| VACATION | `#3B82F6` (blauw) |
| SICK | `#EF4444` (rood) |
| MATERNITY | `#EC4899` (roze) |
| PUBLIC_HOLIDAY | `#F59E0B` (amber) |
| OTHER | `#6B7280` (grijs) |

---

## 3. Typografie

### Lettertypen
- **Manrope** — alle bodytekst, headings, labels, UI-elementen
- **DM Mono** — timers, tijden, codes, getallen in tabellen, technische waarden

### Schaalverdeling
| Naam | Klasse | Gebruik |
|---|---|---|
| xs | `text-xs` (12px) | Labels, badges, timestamps |
| sm | `text-sm` (14px) | Bodytekst, form labels |
| base | `text-base` (16px) | Standaard bodytekst |
| lg | `text-lg` (18px) | Subheadings, nadruk |
| xl | `text-xl` (20px) | Pagina-titels klein |
| 2xl | `text-2xl` (24px) | Pagina-titels groot |
| 3xl+ | `text-3xl`–`text-5xl` | KPI-waarden, tijdweergave |

### Timer weergave (verplicht patroon)
```tsx
<span className="font-mono tabular-nums text-4xl font-medium tracking-tight">
  01:34:22
</span>
```

### Gewichten
- Regular (400): bodytekst
- Medium (500): labels, subtitels
- Bold (700): headings, KPI-waarden
- ExtraBold (800): grote hero-cijfers

---

## 4. Spacing & Layout

### Spacing schaal (8pt grid)
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Breakpoints
| Naam | Breedte | Doel |
|---|---|---|
| Mobile | 390px | Primaire mobiele weergave (iPhone 14) |
| Tablet | 768px | Tablet portrait |
| Desktop | 1280px | Standaard desktop |
| Wide | 1440px | Breed scherm |

Elke pagina **verplicht** werkt op 390px en 1280px. Testen voor elke PR.

### Sidebar
- Desktop: 240px breed, collapsed: 64px (iconen alleen)
- Mobile: slide-in overlay, 280px breed
- Collapse animatie: `transition-all duration-200 ease-in-out`

### Content-breedte
- Max content-breedte: `max-w-5xl` (1024px) gecentreerd
- Dashboard-brede secties: `max-w-7xl` (1280px)

---

## 5. Componenten Patronen

### Elke pagina heeft 4 states (verplicht)

```tsx
// 1. Gevulde state — mock data of echte data
// 2. Lege state — nog geen data
<EmptyState
  icon={Clock}
  title={t('empty.title')}
  description={t('empty.description')}
  cta={{ label: t('empty.cta'), href: '/tijdlijn' }}
/>
// 3. Laadstate — skeleton loaders
<Skeleton className="h-24 w-full rounded-lg" />
// 4. Foutstate — waar van toepassing
<ErrorState message={error.message} retry={() => router.refresh()} />
```

### Kaarten
- Achtergrond: surface kleur
- Border: 1px border kleur
- Border-radius: `rounded-xl` (12px)
- Padding: `p-6`
- Shadow: geen shadow — borders voor afscheiding

### Knoppen
- Primair: accent achtergrond, wit tekst, `rounded-lg`
- Secundair: border, transparant achtergrond
- Ghost: geen border, transparant, accent hover
- Destructive: rood
- Minimale hoogte touch target: **48px** (verplicht voor mobiel)

### Badges / tags
- Kleine pill: `rounded-full text-xs px-2 py-0.5`
- Uretype badge: gekleurde achtergrond op basis van status-kleuren (sectie 2)

### Forms
- Label boven input
- Foutmelding direct onder input (rood, `text-sm`)
- Successtatus: groen border
- Placeholder: altijd in het Nederlands

### Dialogen / modals
- Maximale breedte: `max-w-lg`
- Close-knop rechtsboven
- Destructieve actie: rood, altijd rechtsonder
- shadcn/ui Dialog, geen custom modals

---

## 6. Navigatie

### Sidebar items (volgorde)
1. Dashboard
2. Tijdlijn (timer + overzicht)
3. Agenda
4. Klanten
5. Onkosten
6. Financieel (cashflow + verlof)
7. Export
8. Instellingen (onderaan)

### Actieve state
- Accent achtergrond (licht), accent tekst, linker border accent (4px)

### Notifications / badges
- Rode dot of getal voor: onbevestigde agenda-events, einde-dag samenvatting
- Max weergave: `99+`

---

## 7. Data Visualisatie

### 1.225u Ring
- Donut chart, groot en prominent op dashboard
- Groen bij ≥ 100%, oranje bij 70-99%, rood bij < 70%
- Tooltip: uitsplitsing direct / indirect per categorie
- Animatie: fill bij eerste load (600ms ease-out)

### Tijdlijn (dag/week)
- Dagview: 06:00–23:00, elk uur als rij
- Gekleurde blokken op basis van uretype kleur (sectie 2)
- Gap: gestippeld blok met "+" icoon als suggestie
- Verlofdag: gekleurde overlay op de hele dag (sectie 2, verlofkleuren)

### KPI-kaarten
- Groot getal bovenaan (DM Mono, bold)
- Label eronder (Manrope, sm, muted)
- Optioneel: trend pijl (groen omhoog, rood omlaag)

### Cashflow grafiek
- Recharts LineChart, cumulatief saldo
- Kleurcodering lijn: groen (positief boven buffer), oranje (boven nul onder buffer), rood (negatief)
- BTW-momenten: verticale stippellijn met label

### Compliance donut
- Opdrachtgever-concentratie als horizontal bar chart
- Kleurcodering: rood > 70%, oranje 50-70%, groen < 50%

---

## 8. Animaties & Transities

- Sidebar collapse: `transition-all duration-200 ease-in-out`
- Modal open/close: shadcn/ui standaard (150ms fade + scale)
- Hover knoppen: `transition-colors duration-100`
- Skeleton pulse: shadcn/ui standaard
- Geen page transitions — directe navigatie
- Timer teller: geen animatie — strakke cijferwissel (font `tabular-nums`)

---

## 9. Dark / Light Mode

- Toggle zichtbaar in sidebar (zon/maan icoon)
- Systeem-voorkeur bij eerste bezoek (`prefers-color-scheme`)
- Keuze persisteren in `localStorage`
- Alle componenten werken in beide modes
- Accent `#3D52D5` verandert **niet** per mode

---

## 10. Mobiele UX

### Touch targets
- Minimaal **48×48px** voor alle interactieve elementen
- Timer start/stop: minimaal **64×64px** (primaire actie)

### Navigatie mobiel
- Sidebar: hamburger → overlay
- Bottom navigation **NIET** gebruiken — sidebar-overlay is voldoende

### Timer op mobiel
- Grote weergave, volledig scherm mogelijk
- Start/stop prominent in het midden van het scherm

---

## 11. Lege States & Onboarding

### Lege states
- Altijd een icoon (Lucide React), titel, beschrijving, en een CTA
- Vriendelijke toon, nooit technisch
- Voorbeeld: "Nog geen klanten — voeg je eerste klant toe"

### Onboarding flow (5 stappen)
- Progressiebalk bovenaan (stap X van 5)
- Elke stap: één duidelijke vraag of actie
- "Overslaan" link bij niet-verplichte stappen (agenda, Jortt)
- Na stap 5: confetti-animatie + redirect naar dashboard

---

## 12. i18n — Teksten

- Alle UI-teksten via `next-intl` — **nooit hardcoded**
- Standaardtaal: Nederlands (browser-detectie, fallback NL)
- Structuur keys: `{module}.{onderdeel}.{element}`

```json
// messages/nl.json — voorbeeld
{
  "dashboard": {
    "greeting": "Goedemorgen, {name}",
    "timer": {
      "start": "Start timer",
      "stop": "Stop timer",
      "empty": "Geen actieve timer"
    }
  }
}
```

---

## 13. PWA Weergave

- `manifest.json` aanwezig
- `display: "standalone"` — geen browser-chrome bij installatie
- Achtergrondkleur manifest: `#111110` (dark app-achtergrond)
- Thema-kleur manifest: `#3D52D5` (accent)
- Timer-shortcut zichtbaar bij installatie op home screen
- Apple meta tags voor iOS installeerbaarheid
