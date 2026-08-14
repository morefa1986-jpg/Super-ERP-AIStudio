$ErrorActionPreference = "Stop"
$taskName = "Fathi Aqua Super ERP Server"

if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}
Write-Host "اجرای دائمی سرور حذف شد؛ اطلاعات و بک‌آپ‌ها دست‌نخورده باقی ماندند."
