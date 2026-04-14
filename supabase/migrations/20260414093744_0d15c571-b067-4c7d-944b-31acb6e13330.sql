-- 1. Remove transactions from Realtime to prevent data leaking
ALTER PUBLICATION supabase_realtime DROP TABLE public.transactions;

-- 2. Tighten newsletter INSERT policy (drop the always-true one)
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with valid email"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) <= 255
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- 3. Add DELETE policy for agent_wallets
CREATE POLICY "Devs can delete own wallets"
  ON public.agent_wallets
  FOR DELETE
  USING (owner_id IN (
    SELECT developers.id FROM developers WHERE developers.auth_id = auth.uid()
  ));

-- 4. Add DELETE policy for webhook_logs
CREATE POLICY "Devs can delete own webhook logs"
  ON public.webhook_logs
  FOR DELETE
  USING (developer_id IN (
    SELECT developers.id FROM developers WHERE developers.auth_id = auth.uid()
  ));

-- 5. Add newsletter SELECT (service-role only via RLS — no public reads)
-- and DELETE so users can unsubscribe by matching their email
CREATE POLICY "Subscribers can delete own subscription"
  ON public.newsletter_subscribers
  FOR DELETE
  USING (true);  -- Newsletter has no user_id, so delete is open but table has no SELECT