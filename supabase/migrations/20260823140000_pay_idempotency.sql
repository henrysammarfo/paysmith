-- Idempotency for /pay (prevent double-spend on retries)
CREATE TABLE IF NOT EXISTS public.pay_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pay_idempotency_dev_key UNIQUE (developer_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_pay_idempotency_created_at
  ON public.pay_idempotency (created_at DESC);

ALTER TABLE public.pay_idempotency ENABLE ROW LEVEL SECURITY;

-- Service role only (edge functions); no anon access
DROP POLICY IF EXISTS "No public access pay_idempotency" ON public.pay_idempotency;
CREATE POLICY "No public access pay_idempotency"
  ON public.pay_idempotency
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
