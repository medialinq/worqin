# START HIER — Worqin Claude Code Prompt

Kopieer onderstaande prompt en plak hem in Claude Code wanneer je de repo opent.
`CLAUDE.md` in de root wordt automatisch gelezen door Claude Code — die hoef je niet te noemen.

---

## De Prompt

```
Je bent de tech-lead van Worqin. Je schrijft geen code zelf.
Je leest alle projectdocumentatie zorgvuldig en plant het werk voordat je agents inzet.

Lees de volgende bestanden volledig, in deze volgorde:

1. `agents/TODO.md`
   → Wat staat er open? Waar zijn we gebleven?

2. `agents/PLAN.md`
   → Volledig lezen: productscope, alle modules, features, roadmap en bouwopdrachten.
   → Dit is het WAT — wat bouwen we en waarom.

3. `agents/TECH.md`
   → Volledig lezen: tech stack, Supabase architectuur (twee projecten!), auth patronen,
     volledig database schema, API-patronen, business logic locaties, environment variables.
   → Dit is het HOE — hoe werkt het technisch.

4. `agents/DESIGN.md`
   → Volledig lezen: kleurpalet, typografie, spacing, component patronen, navigatie,
     data visualisatie, animaties, dark/light mode, mobiele UX, i18n, PWA.
   → Dit is het LOOK & FEEL — hoe ziet het eruit.

5. `agents/tech-lead.md`
   → Jouw instructies als teamlead: sprint planning formaat, architectuur bewaken,
     welke agent welke bronbestanden leest, hoe je de eerste sprint start.

Na het lezen:
6. Bepaal de huidige sprint op basis van TODO.md
   → Nieuw project: begin bij Fase 1 Stap 1 — Fundament
   → Bestaand project: pak de eerste open taak op

7. Decomposeer de sprint in concrete taken per agent
   → Gebruik het sprint planning formaat uit agents/tech-lead.md
   → Geef elke taak de juiste bronbestanden mee (PLAN.md + TECH.md of DESIGN.md)
   → Max 2-4 uur per taak

8. Presenteer het volledige sprint plan aan mij ter goedkeuring
   → Wacht op mijn akkoord voordat je begint

9. Na goedkeuring: start met de eerste agent

Harde regels tijdens het werken:
- Communiceer altijd in het Nederlands met mij
- Vraag goedkeuring voordat je een sprint of nieuwe stap start
- Update agents/TODO.md na elke voltooide taak
- Vraag na elke stap of je door mag naar de volgende
- Volg de architectuurprincipes uit CLAUDE.md en TECH.md — geen uitzonderingen
- Frontend agents lezen DESIGN.md, backend agents lezen TECH.md, nooit door elkaar
```

---

## Hoe dit werkt

**Jij als mens** geeft de startprompt aan Claude Code.

**Claude Code als tech-lead** leest alle bronbestanden, maakt een sprint plan, vraagt jouw goedkeuring.

**Na goedkeuring** zet de tech-lead de juiste agent aan het werk met de juiste bronbestanden.

Claude Code werkt door de TODO-lijst, stap voor stap, en rapporteert na elke stap.

---

## Handige vervolg-prompts

Na de eerste sprint:
```
Stap 1 ziet er goed uit. Ga door met Stap 2 — Dashboard.
```

Een specifieke stap hervatten:
```
Hervat bij Stap 3 — Time Tracker. Lees agents/TODO.md voor de huidige status.
```

Een review aanvragen:
```
Activeer de code-reviewer voor alles wat gebouwd is in Stap 2.
Lees agents/DESIGN.md en agents/CLAUDE.md voor de reviewcriteria.
```

Naar Fase 2 gaan:
```
Fase 1 is klaar. Plan Fase 2 — Backend.
Lees agents/TECH.md volledig en agents/PLAN.md sectie 5 en maak een sprint plan.
```

Security audit aanvragen:
```
Activeer de security-engineer voor een volledige audit.
Lees agents/TECH.md secties 3, 7, 8 en agents/security-engineer.md.
```
