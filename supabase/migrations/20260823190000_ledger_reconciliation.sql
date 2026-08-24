-- Track ledger debits separately from rail settlement (reconcile orphans).
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS ledger_debited_at timestamptz;

COMMENT ON COLUMN public.transactions.ledger_debited_at IS
  'Set when agent_wallets balance_* was debited for this tx; NULL = needs reconcile';

-- Historical rows: assume ledger was debited when rail accepted.
UPDATE public.transactions
SET ledger_debited_at = created_at
WHERE ledger_debited_at IS NULL
  AND status IN ('settled', 'pending');

CREATE INDEX IF NOT EXISTS idx_transactions_ledger_orphans
  ON public.transactions (created_at DESC)
  WHERE ledger_debited_at IS NULL AND status IN ('settled', 'pending');
