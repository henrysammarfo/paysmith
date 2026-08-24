-- Persist payment methods chosen at agents-create (live schema previously lacked column).

ALTER TABLE public.agent_wallets
  ADD COLUMN IF NOT EXISTS payment_methods text[] DEFAULT '{}';

COMMENT ON COLUMN public.agent_wallets.payment_methods IS
  'Preferred rails declared at wallet create; /pay still chooses method per request';
