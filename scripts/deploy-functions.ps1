#!/usr/bin/env pwsh
# Deploy Edge functions that changed in P5–P10 pass.
# Requires: $env:SUPABASE_ACCESS_TOKEN = "sbp_..." (Account → Access Tokens)
$ErrorActionPreference = "Stop"
$REF = "hkngxtrqhnkzkbqgqbjk"
if (-not $env:SUPABASE_ACCESS_TOKEN -and (Test-Path .env)) {
  Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*SUPABASE_ACCESS_TOKEN=(.+)\s*$') { $env:SUPABASE_ACCESS_TOKEN = $matches[1].Trim() }
  }
}
if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Error "Set SUPABASE_ACCESS_TOKEN in .env or env (sbp_...) — not the service_role JWT"
}
$funcs = @(
  @{ Name = "pay"; Jwt = $false },
  @{ Name = "agents-create"; Jwt = $false },
  @{ Name = "agents-balance"; Jwt = $false },
  @{ Name = "reconcile-ledger"; Jwt = $false },
  @{ Name = "partna-quote"; Jwt = $false },
  @{ Name = "webhook-deliver"; Jwt = $true }
)
foreach ($f in $funcs) {
  if ($f.Jwt) {
    npx supabase functions deploy $f.Name --project-ref $REF
  } else {
    npx supabase functions deploy $f.Name --project-ref $REF --no-verify-jwt
  }
}
Write-Host "Deploy complete."
