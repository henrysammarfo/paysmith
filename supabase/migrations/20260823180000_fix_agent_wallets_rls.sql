-- P0: remove open Demo Access on agent_wallets; restore owner-scoped RLS.
-- Root cause (2026-08-23 smoke): policy "Demo Access" USING (true) FOR ALL
-- allowed any authenticated client to read/update/delete any wallet.
-- Note: live transactions.agent_wallet_id is text; agent_wallets.id is uuid.

ALTER TABLE public.agent_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo Access" ON public.agent_wallets;
DROP POLICY IF EXISTS "Devs can view own wallets" ON public.agent_wallets;
DROP POLICY IF EXISTS "Devs can insert own wallets" ON public.agent_wallets;
DROP POLICY IF EXISTS "Devs can update own wallets" ON public.agent_wallets;
DROP POLICY IF EXISTS "Devs can delete own wallets" ON public.agent_wallets;

CREATE POLICY "Devs can view own wallets" ON public.agent_wallets
  FOR SELECT
  USING (
    owner_id IN (
      SELECT id FROM public.developers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Devs can insert own wallets" ON public.agent_wallets
  FOR INSERT
  WITH CHECK (
    owner_id IN (
      SELECT id FROM public.developers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Devs can update own wallets" ON public.agent_wallets
  FOR UPDATE
  USING (
    owner_id IN (
      SELECT id FROM public.developers WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_id IN (
      SELECT id FROM public.developers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Devs can delete own wallets" ON public.agent_wallets
  FOR DELETE
  USING (
    owner_id IN (
      SELECT id FROM public.developers WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Devs can view own txns" ON public.transactions;
DROP POLICY IF EXISTS "Devs can insert own txns" ON public.transactions;
DROP POLICY IF EXISTS "Devs can update own txns" ON public.transactions;
DROP POLICY IF EXISTS "Devs can delete own txns" ON public.transactions;

CREATE POLICY "Devs can view own txns" ON public.transactions
  FOR SELECT
  USING (
    agent_wallet_id IN (
      SELECT aw.id::text FROM public.agent_wallets aw
      WHERE aw.owner_id IN (
        SELECT id FROM public.developers WHERE auth_id = auth.uid()
      )
    )
  );

-- Client inserts of transactions are denied unless wallet is owned;
-- Edge service-role bypasses RLS for settlement writes.
CREATE POLICY "Devs can insert own txns" ON public.transactions
  FOR INSERT
  WITH CHECK (
    agent_wallet_id IN (
      SELECT aw.id::text FROM public.agent_wallets aw
      WHERE aw.owner_id IN (
        SELECT id FROM public.developers WHERE auth_id = auth.uid()
      )
    )
  );
