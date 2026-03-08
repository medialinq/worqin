# Worqin — Agents

Dit is de map met alle instructies voor Claude Code agents.

## Drie bronbestanden (lees in deze volgorde)

| Bestand | Bevat |
|---|---|
| `PLAN.md` | Productscope, alle features, roadmap, bouwopdrachten |
| `TECH.md` | Stack, Supabase patronen, volledig schema, API-patronen |
| `DESIGN.md` | Kleuren, typografie, componenten, layout, animaties |

**Principle:** PLAN.md zegt *wat* gebouwd wordt. TECH.md zegt *hoe* het technisch werkt. DESIGN.md zegt *hoe het eruitziet*. Agents raadplegen alleen het bestand dat relevant is voor hun taak.

## Agent bestanden

| Bestand | Agent | Actief |
|---|---|---|
| `START-HIER.md` | — | Begin hier |
| `TODO.md` | Alle agents | Altijd bijhouden |
| `git-workflow.md` | Alle agents | Lezen voor elke feature |
| `tech-lead.md` | tech-lead | Fase 1–4 |
| `frontend-developer.md` | frontend-developer | Fase 1 primair |
| `backend-developer.md` | backend-developer | Fase 2+ |
| `database-engineer.md` | database-engineer | Fase 2+ |
| `security-engineer.md` | security-engineer | Fase-overgangen + launch |
| `code-reviewer.md` | code-reviewer | Na elke stap |
| `tester.md` | tester | Fase 2+ |
| `devops-engineer.md` | devops-engineer | Fase 3+ |

## Workflow

1. Open Claude Code in de projectroot (waar `CLAUDE.md` staat)
2. Kopieer de prompt uit `agents/START-HIER.md`
3. Claude Code leest automatisch `CLAUDE.md` bij elke sessie
4. Volg de voortgang in `worqin-todo.html` (staat BUITEN de projectmap)
