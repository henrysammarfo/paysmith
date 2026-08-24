-- Stellar settlement + compliance tiers (Paysmith P0.5 / P1)
-- Apply via Supabase SQL editor or `supabase db push`

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS stellar_tx_hash text,
  ADD COLUMN IF NOT EXISTS provider text;

CREATE INDEX IF NOT EXISTS idx_transactions_stellar_tx_hash
  ON public.transactions (stellar_tx_hash)
  WHERE stellar_tx_hash IS NOT NULL;

-- Developer KYB (company behind API keys)
ALTER TABLE public.developers
  ADD COLUMN IF NOT EXISTS kyb_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS kyb_tier text NOT NULL DEFAULT 'sandbox',
  ADD COLUMN IF NOT EXISTS compliance_country text;

COMMENT ON COLUMN public.developers.kyb_status IS 'none | pending | approved | rejected';
COMMENT ON COLUMN public.developers.kyb_tier IS 'sandbox | standard | enhanced';

-- End-user / agent-controller KYC reflected on wallet
ALTER TABLE public.agent_wallets
  ADD COLUMN IF NOT EXISTS kyc_tier text NOT NULL DEFAULT 'tier0',
  ADD COLUMN IF NOT EXISTS kyc_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS stellar_account_id text,
  ADD COLUMN IF NOT EXISTS balance_kes numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_xlm numeric DEFAULT 0;

COMMENT ON COLUMN public.agent_wallets.kyc_tier IS 'tier0 phone-only | tier1 ID | tier2 enhanced — raises policy ceilings';
COMMENT ON COLUMN public.agent_wallets.stellar_account_id IS 'Optional Stellar G... address linked to this agent wallet';
