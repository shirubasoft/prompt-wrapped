param(
  [ValidateSet('codex', 'claude', 'opencode', 'copilot', 'agy', 'qwen')]
  [string]$Harness = 'codex',
  [string]$BaseUrl = 'https://shiruba.software/prompt-wrapped'
)

$ErrorActionPreference = 'Stop'
$taskDir = Join-Path ([System.IO.Path]::GetTempPath()) ("prompt-wrapped-" + [guid]::NewGuid())
$collector = Join-Path $taskDir 'collector.py'

try {
  Write-Host ''
  Write-Host 'Prompt Wrapped setup'
  Write-Host "  Agent: $Harness"
  Write-Host '  Access: read-only analysis'
  Write-Host "  Collector: $BaseUrl/collector.py (temporary)"
  Write-Host ''

  Write-Host '[setup 1/3] Checking Python...'
  $python = if (Get-Command py -ErrorAction SilentlyContinue) { 'py' } elseif (Get-Command python -ErrorAction SilentlyContinue) { 'python' } else { $null }
  if (-not $python) { throw 'Prompt Wrapped needs Python 3.9 or newer.' }
  $version = if ($python -eq 'py') { & $python -3 --version 2>&1 } else { & $python --version 2>&1 }
  if ($LASTEXITCODE -ne 0) { throw 'Prompt Wrapped needs Python 3.9 or newer.' }
  $versionMatch = [regex]::Match("$version", '(\d+)\.(\d+)')
  if (-not $versionMatch.Success -or [int]$versionMatch.Groups[1].Value -lt 3 -or ([int]$versionMatch.Groups[1].Value -eq 3 -and [int]$versionMatch.Groups[2].Value -lt 9)) {
    throw 'Prompt Wrapped needs Python 3.9 or newer.'
  }
  Write-Host "             Found $version."

  Write-Host '[setup 2/3] Downloading the collector to a temporary folder...'
  New-Item -ItemType Directory -Path $taskDir | Out-Null
  Invoke-WebRequest -UseBasicParsing "$BaseUrl/collector.py" -OutFile $collector

  Write-Host "[setup 3/3] Starting the local collector with $Harness..."
  if ($python -eq 'py') { & $python -3 $collector --base-url $BaseUrl --harness $Harness }
  else { & $python $collector --base-url $BaseUrl --harness $Harness }
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
  if (Test-Path $taskDir) { Remove-Item -Recurse -Force $taskDir }
}
