param(
  [ValidateSet('codex', 'claude', 'gemini', 'opencode')]
  [string]$Harness = 'codex',
  [string]$BaseUrl = 'https://shiruba.software/prompt-wrapped'
)

$ErrorActionPreference = 'Stop'
$taskDir = Join-Path ([System.IO.Path]::GetTempPath()) ("prompt-wrapped-" + [guid]::NewGuid())
$collector = Join-Path $taskDir 'collector.py'

try {
  New-Item -ItemType Directory -Path $taskDir | Out-Null
  Invoke-WebRequest -UseBasicParsing "$BaseUrl/collector.py" -OutFile $collector
  $python = if (Get-Command py -ErrorAction SilentlyContinue) { 'py' } elseif (Get-Command python -ErrorAction SilentlyContinue) { 'python' } else { $null }
  if (-not $python) { throw 'Prompt Wrapped needs Python 3.9 or newer.' }
  if ($python -eq 'py') { & $python -3 $collector --harness $Harness }
  else { & $python $collector --harness $Harness }
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
  if (Test-Path $taskDir) { Remove-Item -Recurse -Force $taskDir }
}
