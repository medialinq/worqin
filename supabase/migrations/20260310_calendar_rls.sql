-- SECURITY FIX: Add missing RLS to calendar_filters and calendar_events
-- These tables were missing RLS, allowing cross-tenant data access

ALTER TABLE calendar_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cal_filters_org" ON calendar_filters FOR ALL
  USING (connection_id IN (
    SELECT id FROM calendar_connections
    WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  ));

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cal_events_org" ON calendar_events FOR ALL
  USING (connection_id IN (
    SELECT id FROM calendar_connections
    WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  ));
