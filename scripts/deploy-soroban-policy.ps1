#!/usr/bin/env pwsh
# Build + deploy spending-policy to Stellar testnet.
# Stellar CLI writes progress to stderr; do not treat that as terminating errors.
$ErrorActionPreference = "Continue"
$env:Path = "C:\msys64\mingw64\bin;$env:USERPROFILE\.cargo\bin;C:\Program Files (x86)\Stellar CLI;" + $env:Path

$repo = Split-Path $PSScriptRoot -Parent
$contractDir = Join-Path $repo "contracts\spending-policy"
Push-Location $contractDir

function Invoke-StellarText {
  param([Parameter(Mandatory)][string[]]$Args)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $out = & stellar @Args 2>&1 | ForEach-Object { "$_" }
  $ErrorActionPreference = $prev
  return ($out -join "`n")
}

$keys = Invoke-StellarText @("keys", "ls")
if ($keys -notmatch "paysmith-deploy") {
  Invoke-StellarText @("keys", "generate", "paysmith-deploy", "--network", "testnet", "--fund") | Write-Host
}

$buildOut = Invoke-StellarText @("contract", "build")
Write-Host $buildOut
$wasm = Join-Path $contractDir "target\wasm32v1-none\release\spending_policy.wasm"
if (-not (Test-Path $wasm)) { throw "WASM missing: $wasm" }

$deployOut = Invoke-StellarText @(
  "contract", "deploy",
  "--wasm", $wasm,
  "--source-account", "paysmith-deploy",
  "--network", "testnet",
  "--alias", "paysmith-spending-policy"
)
Write-Host $deployOut
$cid = [regex]::Match($deployOut, "C[A-Z0-9]{55}").Value
if (-not $cid) { throw "Could not parse contract id from deploy output" }
Write-Host "CONTRACT_ID=$cid"

$pol = Join-Path $env:TEMP "paysmith-policy.json"
[System.IO.File]::WriteAllText($pol, '{ "daily_limit": "1000", "max_single_tx": "200" }')
$invokeOut = Invoke-StellarText @(
  "contract", "invoke",
  "--id", $cid,
  "--source-account", "paysmith-deploy",
  "--network", "testnet",
  "--", "check_spend",
  "--policy-file-path", $pol,
  "--amount", "50",
  "--spent_today", "100"
)
Write-Host $invokeOut

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
