param(
  [string]$InstallPath = "",
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
if (-not $InstallPath) {
  $candidate = Get-ChildItem -Path "$env:LOCALAPPDATA\FathiAquaSuperERP\app-*\FathiAquaSuperERP.exe" -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if ($candidate) { $InstallPath = $candidate.FullName }
}
if (-not (Test-Path -LiteralPath $InstallPath)) {
  throw "فایل اجرایی پیدا نشد. مسیر EXE را با پارامتر InstallPath وارد کنید."
}

$taskName = "Fathi Aqua Super ERP Server"
$arguments = "--server"
$action = New-ScheduledTaskAction -Execute $InstallPath -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

[Environment]::SetEnvironmentVariable("PORT", [string]$Port, "Machine")
[Environment]::SetEnvironmentVariable("FATHI_ERP_DATA_DIR", "$env:ProgramData\FathiAquaSuperERP", "Machine")
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Write-Host "سرور دائمی روی پورت $Port نصب و اجرا شد."
