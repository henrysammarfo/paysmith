# Requires: $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
$ErrorActionPreference = "Stop"
$REF = "hkngxtrqhnkzkbqgqbjk"
if (-not $env:SUPABASE_ACCESS_TOKEN -and (Test-Path .env)) {
  Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*SUPABASE_ACCESS_TOKEN=(.+)\s*$') { $env:SUPABASE_ACCESS_TOKEN = $matches[1].Trim() }
  }
}
if (-not $env:SUPABASE_ACCESS_TOKEN) { Write-Error "Set SUPABASE_ACCESS_TOKEN in .env or env (Dashboard → Account → Access Tokens)" }
npx supabase link --project-ref $REF
npx supabase secrets set --env-file .env.edge-secrets --project-ref $REF
npx supabase db push --project-ref $REF
npx supabase functions deploy pay --project-ref $REF --no-verify-jwt
npx supabase functions deploy agents-create --project-ref $REF --no-verify-jwt
npx supabase functions deploy agents-balance --project-ref $REF --no-verify-jwt
npx supabase functions deploy webhook-deliver --project-ref $REF
npx supabase functions deploy reconcile-ledger --project-ref $REF --no-verify-jwt
npx supabase functions deploy partna-quote --project-ref $REF --no-verify-jwt
npx supabase functions deploy waitlist-join --project-ref $REF --no-verify-jwt
npx supabase secrets list --project-ref $REF
npx supabase functions list --project-ref $REF
