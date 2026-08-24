#!/usr/bin/env pwsh
# Build + deploy spending-policy to Stellar testnet.
$ErrorActionPreference = "Stop"
$env:Path = "C:\msys64\mingw64\bin;$env:USERPROFILE\.cargo\bin;C:\Program Files (x86)\Stellar CLI;" + $env:Path

$repo = Split-Path $PSScriptRoot -Parent
$contractDir = Join-Path $repo "contracts\spending-policy"
Push-Location $contractDir

$keys = stellar keys ls 2>&1 | Out-String
if ($keys -notmatch "paysmith-deploy") {
  stellar keys generate paysmith-deploy --network testnet --fund
}

stellar contract build
$wasm = Join-Path $contractDir "target\wasm32v1-none\release\spending_policy.wasm"
if (-not (Test-Path $wasm)) { Write-Error "WASM missing: $wasm" }

$deployOut = stellar contract deploy --wasm $wasm --source-account paysmith-deploy --network testnet --alias paysmith-spending-policy 2>&1 | Out-String
Write-Host $deployOut
$cid = [regex]::Match($deployOut, "C[A-Z0-9]{55}").Value
if (-not $cid) { Write-Error "Could not parse contract id" }
Write-Host "CONTRACT_ID=$cid"

$pol = Join-Path $env:TEMP "paysmith-policy.json"
[System.IO.File]::WriteAllText($pol, '{ "daily_limit": "1000", "max_single_tx": "200" }')
stellar contract invoke --id $cid --source-account paysmith-deploy --network testnet -- check_spend --policy-file-path $pol --amount 50 --spent_today 100

$envFile = Join-Path $repo ".env"
if (Test-Path $envFile) {
  $txt = Get-Content $envFile -Raw
  if ($txt -match "(?m)^STELLAR_SOROBAN_POLICY_CONTRACT_ID=") {
    $txt = $txt -replace "(?m)^STELLAR_SOROBAN_POLICY_CONTRACT_ID=.*", "STELLAR_SOROBAN_POLICY_CONTRACT_ID=$cid"
  } else {
    $txt = $txt.TrimEnd() + "`nSTELLAR_SOROBAN_POLICY_CONTRACT_ID=$cid`n"
  }
  Set-Content $envFile $txt -NoNewline
}

@{
  at = (Get-Date).ToUniversalTime().ToString("o")
  contractId = $cid
  network = "testnet"
  explorer = "https://lab.stellar.org/r/testnet/contract/$cid"
} | ConvertTo-Json | Set-Content (Join-Path $repo "memory\SOROBAN_DEPLOY.json")

Write-Host "Set Edge secret and redeploy pay:"
Write-Host "  npx supabase secrets set STELLAR_SOROBAN_POLICY_CONTRACT_ID=$cid --project-ref hkngxtrqhnkzkbqgqbjk"
Pop-Location
