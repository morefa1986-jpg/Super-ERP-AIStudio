param([string]$InstallPath = (Join-Path $env:LOCALAPPDATA 'FathiAquaSuperERP'), [switch]$PurgeData)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $InstallPath)) { Write-Host 'Installation not found.'; exit 0 }
$storedLanguage = $null
$settingsPath = Join-Path $InstallPath 'install-settings.json'
if (Test-Path -LiteralPath $settingsPath) {
  try { $storedLanguage = (Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json).language } catch { $storedLanguage = $null }
}
$systemLanguage = [System.Globalization.CultureInfo]::InstalledUICulture.TwoLetterISOLanguageName
$requestedLanguage = if ($storedLanguage) { $storedLanguage } elseif ($env:FATHI_ERP_LANGUAGE) { $env:FATHI_ERP_LANGUAGE } else { $systemLanguage }
$lang = ($requestedLanguage -split '[-_]')[0].ToLowerInvariant()
$confirm = @{
  fa = 'حذف Fathi Aqua ERP؟ (Y/N)'; en = 'Remove Fathi Aqua ERP? (Y/N)';
  ar = 'إزالة Fathi Aqua ERP؟ (Y/N)'; de = 'Fathi Aqua ERP entfernen? (J/N)'
}
$prompt = if ($confirm.ContainsKey($lang)) { $confirm[$lang] } else { $confirm.en }
$answer = Read-Host $prompt; if ($answer -notmatch '^(y|yes|j|ja|بله|نعم)$') { exit 0 }
$desktop = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Fathi Aqua ERP.lnk'
if (Test-Path $desktop) { Remove-Item -LiteralPath $desktop -Force }
if ($PurgeData) { Remove-Item -LiteralPath (Join-Path $InstallPath 'data') -Recurse -Force -ErrorAction SilentlyContinue }
Remove-Item -LiteralPath $InstallPath -Recurse -Force
$done = @{
  fa = 'حذف انجام شد. داده‌های کاربر حفظ شدند مگر اینکه -PurgeData استفاده شده باشد.';
  en = 'Uninstallation completed. User data was preserved unless -PurgeData was used.';
  ar = 'اكتملت عملية الإزالة. تم الاحتفاظ ببيانات المستخدم ما لم تستخدم -PurgeData.';
  de = 'Deinstallation abgeschlossen. Benutzerdaten wurden erhalten, sofern -PurgeData nicht verwendet wurde.'
}
$doneMessage = if ($done.ContainsKey($lang)) { $done[$lang] } else { $done.en }
Write-Host $doneMessage
