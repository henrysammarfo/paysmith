-- Schedule reconcile-ledger via pg_cron + pg_net (official Supabase pattern).
-- Docs: https://supabase.com/docs/guides/functions/schedule-functions
-- Secrets must live in Vault (never hardcode service role in migrations).
-- Required vault secrets (run: node scripts/setup-reconcile-cron.mjs):
--   paysmith_project_url      = https://<ref>.supabase.co
--   paysmith_internal_secret  = WEBHOOK_INTERNAL_SECRET (same as Edge)

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.invoke_reconcile_ledger()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'vault'
AS $$
DECLARE
  project_url text;
  internal_secret text;
  request_id bigint;
BEGIN
  SELECT decrypted_secret INTO project_url
  FROM vault.decrypted_secrets
  WHERE name = 'paysmith_project_url'
  LIMIT 1;

  SELECT decrypted_secret INTO internal_secret
  FROM vault.decrypted_secrets
  WHERE name = 'paysmith_internal_secret'
  LIMIT 1;

  IF project_url IS NULL OR internal_secret IS NULL THEN
    RAISE NOTICE 'invoke_reconcile_ledger: vault secrets paysmith_project_url / paysmith_internal_secret missing — skip';
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := rtrim(project_url, '/') || '/functions/v1/reconcile-ledger',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Paysmith-Internal-Secret', internal_secret
    ),
    body := jsonb_build_object('limit', 50, 'source', 'pg_cron'),
    timeout_milliseconds := 30000
  ) INTO request_id;

  RETURN request_id;
END;
$$;

COMMENT ON FUNCTION public.invoke_reconcile_ledger() IS
  'POSTs to Edge reconcile-ledger using Vault secrets; scheduled by pg_cron every 15 min';

DO $$
BEGIN
  PERFORM cron.unschedule('paysmith-reconcile-ledger');
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

SELECT cron.schedule(
  'paysmith-reconcile-ledger',
  '*/15 * * * *',
  $$SELECT public.invoke_reconcile_ledger();$$
);
