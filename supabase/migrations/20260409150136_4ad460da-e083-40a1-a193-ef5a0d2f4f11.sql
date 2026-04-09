
-- DEVELOPERS table
CREATE TABLE public.developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  company text,
  plan text NOT NULL DEFAULT 'starter',
  live_api_key text UNIQUE,
  test_api_key text UNIQUE,
  webhook_url text,
  webhook_secret text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AGENT WALLETS table
CREATE TABLE public.agent_wallets (
  id text PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  name text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL,
  payment_methods text[] DEFAULT '{}',
  spending_policy jsonb DEFAULT '{"dailyLimit":10000,"maxSingleTx":2000,"requireApprovalAbove":5000}',
  chimoney_sub_account_id text,
  api_key text UNIQUE,
  status text NOT NULL DEFAULT 'active',
  balance_ghs numeric DEFAULT 0,
  balance_ngn numeric DEFAULT 0,
  balance_usdc numeric DEFAULT 0,
  total_volume numeric DEFAULT 0,
  total_txns int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TRANSACTIONS table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_wallet_id text NOT NULL REFERENCES public.agent_wallets(id) ON DELETE CASCADE,
  type text NOT NULL,
  recipient text,
  amount numeric NOT NULL,
  currency text NOT NULL,
  method text NOT NULL,
  note text,
  rail_tx_id text,
  status text NOT NULL DEFAULT 'pending',
  fee numeric DEFAULT 0,
  fx_rate numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- WEBHOOK LOGS table
CREATE TABLE public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid REFERENCES public.developers(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb,
  response_status int,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Developers own their data
CREATE POLICY "Devs can view own data" ON public.developers
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Devs can insert own data" ON public.developers
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Devs can update own data" ON public.developers
  FOR UPDATE USING (auth.uid() = auth_id);

-- RLS: Devs own their wallets (via developer ownership)
CREATE POLICY "Devs can view own wallets" ON public.agent_wallets
  FOR SELECT USING (owner_id IN (SELECT id FROM public.developers WHERE auth_id = auth.uid()));

CREATE POLICY "Devs can insert own wallets" ON public.agent_wallets
  FOR INSERT WITH CHECK (owner_id IN (SELECT id FROM public.developers WHERE auth_id = auth.uid()));

CREATE POLICY "Devs can update own wallets" ON public.agent_wallets
  FOR UPDATE USING (owner_id IN (SELECT id FROM public.developers WHERE auth_id = auth.uid()));

-- RLS: Devs own their transactions (via wallet → developer chain)
CREATE POLICY "Devs can view own txns" ON public.transactions
  FOR SELECT USING (agent_wallet_id IN (
    SELECT id FROM public.agent_wallets WHERE owner_id IN (
      SELECT id FROM public.developers WHERE auth_id = auth.uid()
    )
  ));

CREATE POLICY "Devs can insert own txns" ON public.transactions
  FOR INSERT WITH CHECK (agent_wallet_id IN (
    SELECT id FROM public.agent_wallets WHERE owner_id IN (
      SELECT id FROM public.developers WHERE auth_id = auth.uid()
    )
  ));

-- RLS: Webhook logs
CREATE POLICY "Devs can view own webhook logs" ON public.webhook_logs
  FOR SELECT USING (developer_id IN (SELECT id FROM public.developers WHERE auth_id = auth.uid()));

CREATE POLICY "Devs can insert own webhook logs" ON public.webhook_logs
  FOR INSERT WITH CHECK (developer_id IN (SELECT id FROM public.developers WHERE auth_id = auth.uid()));

-- INDEXES
CREATE INDEX idx_agent_wallets_owner ON public.agent_wallets(owner_id);
CREATE INDEX idx_transactions_wallet ON public.transactions(agent_wallet_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created ON public.transactions(created_at);

-- Trigger to auto-create developer record on signup
CREATE OR REPLACE FUNCTION public.handle_new_developer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.developers (auth_id, email, live_api_key, test_api_key)
  VALUES (
    NEW.id,
    NEW.email,
    'ps_live_' || replace(gen_random_uuid()::text, '-', ''),
    'ps_test_' || replace(gen_random_uuid()::text, '-', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_developer
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_developer();
