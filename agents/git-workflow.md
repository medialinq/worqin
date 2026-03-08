---
name: git-workflow
description: Bron van waarheid voor Git conventies, branching en worktrees.
---

# Git Workflow — Worqin

## Branch structuur

```
main          ← productie — altijd deployable
  └── develop ← integratiebranch
        ├── feature/fundament
        ├── feature/dashboard
        ├── feature/timer
        └── hotfix/[naam]   ← vanuit main
```

**Regels:**
- Altijd vanuit `develop` branchen
- Uitzondering: `hotfix/*` vanuit `main`
- Lowercase namen, koppeltekens, geen spaties
- Nooit direct naar `main` pushen

---

## Worktree setup (eenmalig)

```bash
git clone --bare git@github.com:jouw-org/worqin.git worqin.git
cd worqin.git
git worktree add ../worqin-main main
git worktree add ../worqin-develop develop
```

## Nieuwe feature starten

```bash
cd ../worqin-develop && git pull origin develop
git worktree add ../worqin-feature-dashboard feature/dashboard
cd ../worqin-feature-dashboard
# Werken...
git add -p
git commit -m "feat(dashboard): add KPI cards with 1225 hour ring"
git push origin feature/dashboard
```

## Merge flow

```
feature/X  →  develop     squash and merge
develop    →  main         merge commit
```

## Worktree opruimen na merge

```bash
cd worqin.git
git worktree remove ../worqin-feature-dashboard
git branch -d feature/dashboard
git push origin --delete feature/dashboard
```

---

## Commit formaat (verplicht)

```
feat(timer):      nieuwe functionaliteit
fix(agenda):      bugfix
security(auth):   security gerelateerde wijziging
refactor(db):     code verbetering
docs:             documentatie
test(export):     tests
chore(deps):      dependency updates
```

---

## PR checklist

Voordat je een PR opent naar `develop`:

- [ ] `pnpm tsc --noEmit` — geen TypeScript errors
- [ ] `pnpm lint` — geen ESLint errors
- [ ] Geen `"Worqin"` hardcoded in componenten
- [ ] Geen `console.log`
- [ ] `agents/TODO.md` bijgewerkt

---

## Parallel werken met agents

```
worqin-feature-dashboard/    ← frontend-developer
worqin-feature-timer/        ← frontend-developer (aparte worktree)
```

Agents werken nooit in dezelfde worktree. Tech-lead coördineert volgorde.
