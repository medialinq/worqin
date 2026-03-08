# Worqin — Technische Architectuur
> Alle technische beslissingen staan hier. Los van design.
> Agents lezen dit voor elk backend-onderdeel, API route of database wijziging.
> Versie 2.0 · Maart 2026

---

## 1. Tech Stack

| Laag | Keuze | Reden |
|---|---|---|
| Frontend | Next.js 14 App Router | SSR, file-based routing, RSC |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, headless components |
| Forms | react-hook-form + zod | Type-safe validatie |
| Backend | Next.js API routes + Server Actions | Monorepo, geen extra service |
| Database | Supabase (PostgreSQL + RLS) | Auth + DB + storage in één, EU-hosted |
| Auth ZZP | Supabase Auth + `@supabase/ssr` | Ingebouwd, geen NextAuth nodig |
| Auth Admin | Supabase Auth (apart project) + TOTP 2FA | Volledig gescheiden |
| Storage | Supabase Storage | Ingebouwd, EU, per-org buckets |
| Betalingen | Mollie | NL-based, iDEAL, GDPR-proof |
| E-mail | Resend | Developer-friendly, EU |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) | Kostenefficiënt, sterk |
| i18n | next-intl | NL standaard, EN beschikbaar |
| Hosting | Coolify op eigen VPS | EU, volledige controle |
| CI/CD | GitHub Actions | Deploy naar Coolify via webhook |

---

## 2. Supabase Architectuur — Twee Gescheiden Projecten

**KRITISCH: Eén project per gebruikersgroep. Nooit mengen.**

| | ZZP-app | Admin-app |
|---|---|---|
| Project naam | `worqin-app` | `worqin-admin` |
| Domein | worqin.app | admin.worqin.app |
| Auth methoden | E-mail, Google OAuth, Microsoft OAuth | E-mail + wachtwoord + TOTP 2FA |
| Registratie | Self-service | Invite-only via SUPER_ADMIN |
| RLS | Aan op alle tabellen | Aan op alle tabellen |
| Storage buckets | `receipts` (private, per org) | — |

---

## 3. Supabase Client Patronen (verplicht)

### Installatie

```bash
pnpm add @supabase/ssr @supabase/supabase-js
```

### Server client (Server Components, API routes, Server Actions)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )
}
```

### Browser client (Client Components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### KRITISCHE AUTH REGEL: `getClaims()`, NOOIT `getSession()`

```typescript
// ✅ GOED — server-side, niet cacheable, altijd actueel
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getClaims()
if (!user) redirect('/login')

// ❌ FOUT — getSession() kan stale data retourneren
const { data: { session } } = await supabase.auth.getSession()
```

### Middleware — sessie vernieuwen

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getClaims()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## 4. Database Schema (Supabase SQL)

Schema wordt beheerd via `supabase/migrations/`. Geen Prisma — Supabase client met gegenereerde TypeScript types.

### Types genereren (na elke schema-wijziging)

```bash
npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
```

### RLS patroon (verplicht op elke tabel)

```sql
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON time_entries
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
```

### Volledig schema

```sql
-- ════════════════════════════════════════════════════
-- TENANCY
-- ════════════════════════════════════════════════════

CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'TRIAL'
                  CHECK (plan IN ('TRIAL','STARTER','PRO','TEAM')),
  trial_ends_at TIMESTAMPTZ,
  mollie_id     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_self" ON organizations FOR ALL
  USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ════════════════════════════════════════════════════
-- USERS
-- ════════════════════════════════════════════════════

CREATE TABLE users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id     UUID NOT NULL REFERENCES organizations(id),
  email               TEXT NOT NULL,
  name                TEXT,
  role                TEXT NOT NULL DEFAULT 'MEMBER'
                        CHECK (role IN ('OWNER','ADMIN','MEMBER')),
  avatar_url          TEXT,
  weekly_hour_goal    INT NOT NULL DEFAULT 36,
  rounding_interval   TEXT NOT NULL DEFAULT 'NONE'
                        CHECK (rounding_interval IN ('NONE','MIN_15','MIN_30','MIN_60')),
  notif_window_start  TEXT NOT NULL DEFAULT '09:00',
  notif_window_end    TEXT NOT NULL DEFAULT '17:00',
  notif_interval_mins INT NOT NULL DEFAULT 60,
  notif_weekdays_only BOOLEAN NOT NULL DEFAULT true,
  notif_enabled       BOOLEAN NOT NULL DEFAULT true,
  onboarded_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_org" ON users FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE INDEX idx_users_org ON users(organization_id);

-- ════════════════════════════════════════════════════
-- CLIENTS & PROJECTS
-- ════════════════════════════════════════════════════

CREATE TABLE clients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  name             TEXT NOT NULL,
  email            TEXT,
  color            TEXT NOT NULL DEFAULT '#3D52D5',
  hourly_rate      NUMERIC(10,2),
  km_rate          NUMERIC(10,2),
  minimum_minutes  INT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_favorite      BOOLEAN NOT NULL DEFAULT false,
  -- Externe koppelingen — altijd nullable, Worqin is bron van waarheid
  jortt_id         TEXT,
  moneybird_id     TEXT,
  eboekhoud_id     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_org" ON clients FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE INDEX idx_clients_org ON clients(organization_id);

CREATE TABLE projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  client_id        UUID NOT NULL REFERENCES clients(id),
  name             TEXT NOT NULL,
  description      TEXT,
  budget_hours     NUMERIC(8,2),
  hourly_rate      NUMERIC(10,2),    -- overschrijft klanttarief indien ingesteld
  color            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  jortt_project_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_org" ON projects FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);

-- ════════════════════════════════════════════════════
-- TIME ENTRIES
-- ════════════════════════════════════════════════════

CREATE TABLE time_entries (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID NOT NULL REFERENCES organizations(id),
  user_id              UUID NOT NULL REFERENCES users(id),
  client_id            UUID REFERENCES clients(id),
  project_id           UUID REFERENCES projects(id),
  calendar_event_id    TEXT,

  started_at           TIMESTAMPTZ NOT NULL,
  stopped_at           TIMESTAMPTZ,
  duration_mins        INT,
  duration_raw_mins    INT,          -- werkelijke duur, nooit overschrijven
  duration_billed_mins INT,          -- na minimum + afronding (wat exporteert)
  description          TEXT,
  type                 TEXT NOT NULL DEFAULT 'BILLABLE'
                         CHECK (type IN (
                           'BILLABLE','NON_BILLABLE','PRO_BONO',
                           'INDIRECT_ADMIN','INDIRECT_SALES',
                           'INDIRECT_TRAVEL','INDIRECT_LEARNING','INDIRECT_OTHER'
                         )),
  is_indirect          BOOLEAN NOT NULL DEFAULT false, -- auto via trigger
  hourly_rate_snapshot NUMERIC(10,2), -- tarief op moment van registratie
  km_rate_snapshot     NUMERIC(10,2),
  is_export_ready      BOOLEAN NOT NULL DEFAULT false,
  exported_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entries_org" ON time_entries FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE INDEX idx_entries_org     ON time_entries(organization_id);
CREATE INDEX idx_entries_user    ON time_entries(user_id);
CREATE INDEX idx_entries_started ON time_entries(started_at DESC);

-- is_indirect automatisch zetten
CREATE OR REPLACE FUNCTION set_is_indirect() RETURNS TRIGGER AS $$
BEGIN NEW.is_indirect := NEW.type LIKE 'INDIRECT_%'; RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_is_indirect
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION set_is_indirect();

-- ════════════════════════════════════════════════════
-- AGENDA
-- ════════════════════════════════════════════════════

CREATE TABLE calendar_connections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  user_id          UUID NOT NULL REFERENCES users(id),
  provider         TEXT NOT NULL CHECK (provider IN ('GOOGLE','MICROSOFT')),
  account_email    TEXT NOT NULL,
  access_token     TEXT NOT NULL,  -- AES-256-GCM encrypted
  refresh_token    TEXT NOT NULL,  -- AES-256-GCM encrypted
  token_expires_at TIMESTAMPTZ NOT NULL,
  last_synced_at   TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cal_conn_org" ON calendar_connections FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE INDEX idx_cal_conn_user ON calendar_connections(user_id);

CREATE TABLE calendar_filters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  calendar_id   TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  is_visible    BOOLEAN NOT NULL DEFAULT true,
  color         TEXT
);

CREATE TABLE calendar_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id       UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  provider_event_id   TEXT NOT NULL,
  title               TEXT NOT NULL,
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ NOT NULL,
  location            TEXT,
  is_recurring        BOOLEAN NOT NULL DEFAULT false,
  is_billable         BOOLEAN,
  suggested_client_id UUID REFERENCES clients(id),
  confirmed_at        TIMESTAMPTZ,
  UNIQUE(connection_id, provider_event_id)
);
CREATE INDEX idx_cal_events_start ON calendar_events(start_at DESC);

-- ════════════════════════════════════════════════════
-- TAKEN
-- ════════════════════════════════════════════════════

CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  user_id           UUID NOT NULL REFERENCES users(id),
  title             TEXT NOT NULL,
  due_at            TIMESTAMPTZ,
  client_id         UUID REFERENCES clients(id),
  project_id        UUID REFERENCES projects(id),
  is_completed      BOOLEAN NOT NULL DEFAULT false,
  calendar_event_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_org" ON tasks FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE INDEX idx_tasks_user ON tasks(user_id);

-- ════════════════════════════════════════════════════
-- ONKOSTEN
-- ════════════════════════════════════════════════════

CREATE TABLE expenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  user_id          UUID NOT NULL REFERENCES users(id),
  client_id        UUID REFERENCES clients(id),
  project_id       UUID REFERENCES projects(id),
  type             TEXT NOT NULL CHECK (type IN ('RECEIPT','MILEAGE','OTHER')),
  description      TEXT NOT NULL,
  amount           NUMERIC(10,2) NOT NULL,
  vat_rate         NUMERIC(5,2),  -- opslaan, NOOIT berekenen
  receipt_url      TEXT,          -- Supabase Storage path
  date             DATE NOT NULL,
  is_export_ready  BOOLEAN NOT NULL DEFAULT false,
  exported_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_org" ON expenses FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE INDEX idx_expenses_org ON expenses(organization_id);

-- ════════════════════════════════════════════════════
-- INTEGRATIES
-- ════════════════════════════════════════════════════

CREATE TABLE jortt_connections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID UNIQUE NOT NULL REFERENCES organizations(id),
  access_token     TEXT NOT NULL,  -- AES-256-GCM encrypted
  refresh_token    TEXT NOT NULL,  -- AES-256-GCM encrypted
  token_expires_at TIMESTAMPTZ NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  last_tested_at   TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE jortt_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jortt_org" ON jortt_connections FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE TABLE export_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  type             TEXT NOT NULL CHECK (type IN ('TIME_ENTRIES','EXPENSES')),
  status           TEXT NOT NULL CHECK (status IN ('SUCCESS','PARTIAL','FAILED')),
  entry_count      INT NOT NULL,
  jortt_response   JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "export_logs_org" ON export_logs FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ════════════════════════════════════════════════════
-- AI
-- ════════════════════════════════════════════════════

CREATE TABLE ai_suggestions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id),
  type         TEXT NOT NULL CHECK (type IN (
                 'DESCRIPTION','CLIENT_MATCH','BILLABLE_CLASS','GAP_FILL','TRAVEL_TIME'
               )),
  input        JSONB NOT NULL,
  suggestion   TEXT NOT NULL,
  was_accepted BOOLEAN,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_own" ON ai_suggestions FOR ALL USING (user_id = auth.uid());

-- ════════════════════════════════════════════════════
-- TIMER TEMPLATES
-- ════════════════════════════════════════════════════

CREATE TABLE timer_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id),
  user_id          UUID NOT NULL REFERENCES users(id),
  name             TEXT NOT NULL,
  client_id        UUID REFERENCES clients(id),
  project_id       UUID REFERENCES projects(id),
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'BILLABLE'
                     CHECK (type IN (
                       'BILLABLE','NON_BILLABLE','PRO_BONO',
                       'INDIRECT_ADMIN','INDIRECT_SALES',
                       'INDIRECT_TRAVEL','INDIRECT_LEARNING','INDIRECT_OTHER'
                     )),
  default_mins     INT,
  color            TEXT,
  is_favorite      BOOLEAN NOT NULL DEFAULT false,
  usage_count      INT NOT NULL DEFAULT 0,
  last_used_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE timer_templates ENABLE ROW LEVEL SECURITY;
-- Templates zijn per user, niet per org
CREATE POLICY "templates_user" ON timer_templates FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_templates_user ON timer_templates(user_id);

-- ════════════════════════════════════════════════════
-- VERLOF & ZIEKTE
-- ════════════════════════════════════════════════════

CREATE TABLE leave_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  date            DATE NOT NULL,  -- DATE, geen TIMESTAMP
  type            TEXT NOT NULL CHECK (type IN (
                    'VACATION','SICK','MATERNITY','PUBLIC_HOLIDAY','OTHER'
                  )),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE leave_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_user" ON leave_entries FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_leave_user ON leave_entries(user_id);

-- ════════════════════════════════════════════════════
-- CASHFLOW INSTELLINGEN
-- ════════════════════════════════════════════════════

CREATE TABLE cashflow_settings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        UUID UNIQUE NOT NULL REFERENCES organizations(id),
  monthly_fixed_expenses NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_reserve_percentage INT NOT NULL DEFAULT 30,
  current_balance        NUMERIC(10,2) NOT NULL DEFAULT 0,
  safety_buffer          NUMERIC(10,2) NOT NULL DEFAULT 5000,
  vat_frequency          TEXT NOT NULL DEFAULT 'QUARTERLY'
                           CHECK (vat_frequency IN ('MONTHLY','QUARTERLY','YEARLY')),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE cashflow_settings ENABLE ROW LEVEL SECURITY;
-- 1-op-1 met organization, niet per user
CREATE POLICY "cashflow_org" ON cashflow_settings FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ════════════════════════════════════════════════════
-- ADMIN TABELLEN (worqin-admin project — apart!)
-- ════════════════════════════════════════════════════

CREATE TABLE admin_users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'SUPPORT'
                  CHECK (role IN ('SUPER_ADMIN','SUPPORT','BILLING')),
  totp_secret   TEXT,      -- AES-256-GCM encrypted, null totdat 2FA ingesteld
  totp_verified BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_by    UUID REFERENCES admin_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  role        TEXT NOT NULL,
  token       TEXT UNIQUE NOT NULL,  -- gehashed, geldig 24u
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_by  UUID NOT NULL REFERENCES admin_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES admin_users(id),
  action          TEXT NOT NULL,
  target_org_id   UUID,
  target_admin_id UUID,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_org   ON admin_audit_logs(target_org_id);
```

---

## 5. Tenant-Isolatie — Harde Regels

```typescript
// ✅ GOED — RLS + expliciet filter
const { data } = await supabase
  .from('time_entries')
  .select('*')
  .eq('user_id', user.id)  // RLS filtert org, user_id voor performance

// ❌ FOUT — nooit zonder filter
const { data } = await supabase.from('time_entries').select('*')
```

**organization_id in app_metadata** — zetten bij registratie:
```typescript
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { organization_id: org.id, role: 'OWNER' }
})
```

---

## 6. Verplicht API Route Patroon

```typescript
// app/api/[resource]/route.ts
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // 1. Auth — altijd getClaims()
  const { data: { user } } = await supabase.auth.getClaims()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Query — RLS doet isolatie, wees ook expliciet
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

const CreateSchema = z.object({
  description: z.string().min(1),
  clientId: z.string().uuid().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getClaims()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 3. Zod validatie op alle input
  const body = CreateSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error }, { status: 400 })

  // 4. organization_id nooit uit request — uit auth context
  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('time_entries')
    .insert({ ...body.data, user_id: user.id, organization_id: profile!.organization_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

---

## 7. Token Encryptie (verplicht voor agenda + Jortt tokens)

```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')  // 64 hex chars = 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':')
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(Buffer.from(encryptedHex, 'hex')) + decipher.final('utf8')
}
```

---

## 8. Agenda OAuth — Volledig Los van Supabase Auth

**TWEE flows — NOOIT mengen:**

| | Supabase Auth (login) | Agenda OAuth |
|---|---|---|
| Doel | Wie ben jij? | Mag ik je agenda lezen? |
| Handler | Supabase ingebouwd | `app/api/agenda/connect` + `/callback` |
| Token opslag | Supabase Auth intern | `calendar_connections`, encrypted |
| Trigger | Login/registratie | Expliciete gebruikersactie in instellingen |

```typescript
// app/api/agenda/connect/route.ts
export async function GET(request: Request) {
  const provider = new URL(request.url).searchParams.get('provider')
  const state = crypto.randomUUID()  // CSRF bescherming — opslaan in httpOnly cookie
  const authUrl = buildAgendaOAuthUrl(provider, state)
  return NextResponse.redirect(authUrl)
}

// app/api/agenda/callback/route.ts
export async function GET(request: Request) {
  // 1. Valideer state (CSRF)
  // 2. Exchange code voor tokens
  // 3. Sla encrypted op in calendar_connections
  // 4. Redirect naar /instellingen/agenda
}
```

---

## 9. Supabase Storage

```typescript
// Bonnetje uploaden
const path = `${organizationId}/${expenseId}.${ext}`
await supabase.storage.from('receipts').upload(path, file, {
  contentType: file.type, upsert: false
})

// Tijdelijke URL genereren (1 uur)
const { data: { signedUrl } } = await supabase.storage
  .from('receipts')
  .createSignedUrl(path, 3600)
```

Storage RLS (bucket policy):
```sql
CREATE POLICY "receipts_own_org" ON storage.objects FOR ALL
  USING (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );
```

---

## 10. Business Logic — Kernberekeningen

### 1.225u criterium

```typescript
// lib/hours-criterion.ts
export function calculate1225Progress(entries: TimeEntry[], leaveEntries: LeaveEntry[], year: number) {
  const yearEntries = entries.filter(e => new Date(e.started_at).getFullYear() === year)

  const directMins = yearEntries
    .filter(e => ['BILLABLE','NON_BILLABLE','PRO_BONO'].includes(e.type))
    .reduce((s, e) => s + (e.duration_mins ?? 0), 0)

  const indirectMins = yearEntries
    .filter(e => e.is_indirect)
    .reduce((s, e) => s + (e.duration_mins ?? 0), 0)

  // Zwangerschapsverlof telt mee (max 16 weken)
  const maternityDays = leaveEntries.filter(e =>
    e.type === 'MATERNITY' && new Date(e.date).getFullYear() === year
  ).length
  const maternityBonus = Math.min(maternityDays / 5, 16) * (directMins / 52 / 60)

  const totalHours = (directMins + indirectMins) / 60 + maternityBonus

  return {
    totalHours,
    directHours: directMins / 60,
    indirectHours: indirectMins / 60,
    maternityBonus,
    percentage: Math.min((totalHours / 1225) * 100, 100),
    remainingHours: Math.max(1225 - totalHours, 0),
  }
}
```

### Cashflow voorspelling (90 dagen)

```typescript
// lib/cashflow/forecast.ts
// Berekent: openHours × tarief = verwachte omzet per maand
// Berekent: cummulatief saldo na belastingreservering + vaste lasten
// Markeert: BTW-afdracht momenten
// Output: CashflowForecast met maandkaarten + samenvatting
```

### Wet DBA compliance score

```typescript
// lib/compliance/dba-check.ts
// Berekent: opdrachtgever-diversiteitscore (LAAG/GEMIDDELD/GOED)
// Waarschuwt bij: > 70% uren bij één klant
// Waarschuwt bij: geen indirecte uren geregistreerd
```

### Effectief uurtarief per klant

```typescript
// lib/analytics/effective-rate.ts
// Berekent: effectiveRate = grossRevenue / totalHours (incl. indirect)
// Output: rateGap, uitsplitsing, inzicht-tekst
```

---

## 11. Jortt Integratie

Jortt gebruikt OAuth 2.0, geen API-key. Tokens verlopen na 2 uur.

```typescript
// lib/integrations/jortt.ts
interface BookkeepingAdapter {
  testConnection(): Promise<boolean>
  exportTimeEntries(entries: TimeEntry[], mapping: ClientMapping): Promise<ExportResult>
  exportExpenses(expenses: Expense[], mapping: ClientMapping): Promise<ExportResult>
}
// Toekomstige adapters volgen dezelfde interface: MoneybirdAdapter, eBoekhoudAdapter
```

**Worqin is altijd bron van waarheid:**
- Klant aanmaken in Worqin, daarna optioneel handmatig koppelen aan Jortt-klant via dropdown
- Geen automatische sync — gebruiker koppelt bewust

---

## 12. AI Architectuur

Geen chat-interface. AI werkt op de achtergrond voor afgebakende taken.

```typescript
// lib/ai.ts — model: claude-sonnet-4-6
export async function generateDescription(ctx: DescriptionContext): Promise<string>
export async function classifyEvent(ctx: EventContext): Promise<ClassifyResult>
export async function detectGaps(ctx: GapContext): Promise<GapSuggestion[]>
export async function generateDailyBriefing(ctx: BriefingContext): Promise<string>
export async function calculate1225Projection(ctx: ProjectionContext): Promise<Date>
```

- Alle suggesties opslaan in `ai_suggestions` (voor kwaliteitsmeting via `was_accepted`)
- Rate limit: max 50 calls per gebruiker per dag
- Uitschakelbaar per type in gebruikersinstellingen

---

## 13. Projectstructuur

```
worqin/
├── config/
│   ├── brand.ts              ← WHITE-LABEL (zie DESIGN.md)
│   └── app.ts
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── tijdlijn/
│   │   ├── agenda/
│   │   ├── klanten/[id]/
│   │   ├── onkosten/
│   │   ├── financieel/
│   │   │   ├── cashflow/
│   │   │   └── verlof/
│   │   └── instellingen/
│   │       ├── account/
│   │       ├── agenda/
│   │       ├── compliance/
│   │       └── templates/
│   ├── (admin)/
│   └── api/
│       ├── agenda/connect/ + callback/ + sync/
│       ├── compliance/tax-export/
│       ├── end-of-day/summary/
│       ├── export/jortt/
│       ├── ai/
│       └── billing/webhooks/
├── components/
│   ├── ui/                   ← shadcn/ui (NOOIT aanpassen)
│   └── [feature]/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts          ← gegenereerd via `supabase gen types`
│   ├── crypto.ts
│   ├── ai.ts
│   ├── hours-criterion.ts
│   ├── cashflow/forecast.ts
│   ├── compliance/dba-check.ts
│   ├── analytics/effective-rate.ts
│   └── integrations/
│       ├── jortt.ts
│       └── clients.ts
├── hooks/
├── messages/nl.json + en.json
├── middleware.ts
├── supabase/migrations/
└── agents/
```

---

## 14. Environment Variables

```bash
# Supabase ZZP-app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # alleen server-side

# Supabase Admin (apart project)
NEXT_PUBLIC_ADMIN_SUPABASE_URL=
NEXT_PUBLIC_ADMIN_SUPABASE_PUBLISHABLE_KEY=
ADMIN_SUPABASE_SERVICE_ROLE_KEY=

# Encryptie
ENCRYPTION_KEY=                    # 64 hex chars (32 bytes)

# OAuth agenda
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# Integraties
MOLLIE_API_KEY=
MOLLIE_WEBHOOK_SECRET=
RESEND_API_KEY=
ANTHROPIC_API_KEY=

# URLs
NEXT_PUBLIC_APP_URL=https://worqin.app
NEXT_PUBLIC_ADMIN_URL=https://admin.worqin.app
```

---

## 15. Harde Technische Regels

1. **`getClaims()`, NOOIT `getSession()`** — op alle server-side code
2. **RLS op elke tabel** — geen uitzonderingen
3. **`organization_id` altijd uit auth context** — nooit uit request body of URL params
4. **OAuth tokens encrypted** — altijd via `lib/crypto.ts`
5. **Login-OAuth ≠ Agenda-OAuth** — aparte flows, nooit mengen
6. **`SUPABASE_SERVICE_ROLE_KEY` alleen server-side** — nooit in `NEXT_PUBLIC_`
7. **Twee Supabase projecten** — app en admin zijn volledig gescheiden
8. **Types via `supabase gen types`** — nooit handmatig typen
9. **BTW niet berekenen** — percentage opslaan, Jortt berekent
10. **Worqin is bron van waarheid** — externe IDs altijd nullable

---

## 16. Schaalbaarheid

Supabase schaalt automatisch mee. Geen codewijzigingen nodig tot ~10.000 gebruikers.

| Bottleneck | Wanneer | Oplossing |
|---|---|---|
| Supabase Free tier | ~500 actieve gebruikers | Upgrade naar Pro |
| Agenda-sync piek | ~1.000+ gebruikers | Supabase Edge Functions + pgmq |
| AI-calls synchroon | ~500+ req/dag | Queue via Edge Functions |
| Storage bandbreedte | ~2.000+ gebruikers | Supabase CDN inschakelen |
