param(
  [string]$Package = "",
  [string]$InstallPath = "",
  [switch]$NoShortcut
)
$ErrorActionPreference = 'Stop'

$systemLanguage = [System.Globalization.CultureInfo]::InstalledUICulture.TwoLetterISOLanguageName
$requestedLanguage = if ($env:FATHI_ERP_LANGUAGE) { $env:FATHI_ERP_LANGUAGE } else { $systemLanguage }
$lang = ($requestedLanguage -split '[-_]')[0].ToLowerInvariant()
if ($lang -notin @('fa','en','ar','de')) { $lang = 'en' }
$labels = @{
  fa = @{ title='نصب Fathi Aqua ERP'; path='مسیر نصب'; choose='مسیر نصب را وارد کنید'; shortcut='ایجاد میانبر روی دسکتاپ؟ (Y/N)'; done='نصب با موفقیت انجام شد' }
  en = @{ title='Install Fathi Aqua ERP'; path='Install path'; choose='Enter installation path'; shortcut='Create a desktop shortcut? (Y/N)'; done='Installation completed successfully' }
  ar = @{ title='تثبيت Fathi Aqua ERP'; path='مسار التثبيت'; choose='أدخل مسار التثبيت'; shortcut='إنشاء اختصار على سطح المكتب؟ (Y/N)'; done='اكتمل التثبيت بنجاح' }
  de = @{ title='Fathi Aqua ERP installieren'; path='Installationspfad'; choose='Installationspfad eingeben'; shortcut='Desktop-Verknüpfung erstellen? (Y/N)'; done='Installation erfolgreich abgeschlossen' }
}
$l = $labels[$lang]
Write-Host "== $($l.title) ==" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 18 or newer is required. Install Node.js and run this installer again.' }
if (-not $InstallPath) {
  $defaultInstallPath = Join-Path $env:LOCALAPPDATA 'FathiAquaSuperERP'
  $InstallPath = Read-Host "$($l.choose) [$defaultInstallPath]"
  if (-not $InstallPath) { $InstallPath = $defaultInstallPath }
}
if (-not $Package) { $Package = Join-Path $PSScriptRoot 'FathiAquaSuperERP-package.zip' }
if (-not (Test-Path -LiteralPath $Package)) { throw "Package not found: $Package" }
New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
Expand-Archive -LiteralPath $Package -DestinationPath $InstallPath -Force
Set-Content -LiteralPath (Join-Path $InstallPath 'install-settings.json') -Value (@{ language=$lang; installedAt=(Get-Date).ToUniversalTime().ToString('o') } | ConvertTo-Json)
$makeShortcut = $false
if (-not $NoShortcut) { $makeShortcut = (Read-Host $l.shortcut) -match '^(y|yes|بله|بلى)$' }
if ($makeShortcut) {
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Fathi Aqua ERP.lnk'))
  $shortcut.TargetPath = (Join-Path $InstallPath 'start-fathi-erp.cmd'); $shortcut.WorkingDirectory = $InstallPath; $shortcut.Save()
}
Write-Host $l.done -ForegroundColor Green
