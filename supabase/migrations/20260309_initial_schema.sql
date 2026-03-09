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
  hourly_rate      NUMERIC(10,2),
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
  duration_raw_mins    INT,
  duration_billed_mins INT,
  description          TEXT,
  type                 TEXT NOT NULL DEFAULT 'BILLABLE'
                         CHECK (type IN (
                           'BILLABLE','NON_BILLABLE','PRO_BONO',
                           'INDIRECT_ADMIN','INDIRECT_SALES',
                           'INDIRECT_TRAVEL','INDIRECT_LEARNING','INDIRECT_OTHER'
                         )),
  is_indirect          BOOLEAN NOT NULL DEFAULT false,
  hourly_rate_snapshot NUMERIC(10,2),
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
  access_token     TEXT NOT NULL,
  refresh_token    TEXT NOT NULL,
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
  vat_rate         NUMERIC(5,2),
  receipt_url      TEXT,
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
  access_token     TEXT NOT NULL,
  refresh_token    TEXT NOT NULL,
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
CREATE POLICY "templates_user" ON timer_templates FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_templates_user ON timer_templates(user_id);

-- ════════════════════════════════════════════════════
-- VERLOF & ZIEKTE
-- ════════════════════════════════════════════════════

CREATE TABLE leave_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  date            DATE NOT NULL,
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
CREATE POLICY "cashflow_org" ON cashflow_settings FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ════════════════════════════════════════════════════
-- STORAGE (receipts bucket)
-- ════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

CREATE POLICY "receipts_own_org" ON storage.objects FOR ALL
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text FROM users WHERE id = auth.uid()
    )
  );
