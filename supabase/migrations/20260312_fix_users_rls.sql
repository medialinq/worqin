-- Fix infinite recursion in users RLS policy.
--
-- The original policy used a self-referential subquery:
--   USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()))
--
-- This causes PostgreSQL to throw "infinite recursion detected in policy for relation users"
-- on every query to the users table, which breaks getAuthContext() → redirect loop.
--
-- Fix: users can only read/write their own row directly via auth.uid().
-- All other tables still use the subquery pattern, which now works without recursion
-- because the users policy no longer recurses.

DROP POLICY IF EXISTS "users_own_org" ON users;

CREATE POLICY "users_self" ON users
  FOR ALL
  USING (id = auth.uid());
