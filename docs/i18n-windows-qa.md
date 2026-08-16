# Multilingual and Windows Release QA

## Languages

Persian (`fa`, RTL), English (`en`, LTR), Arabic (`ar`, RTL), German (`de`, LTR), and Russian (`ru`, LTR).

## Automated checks

- `npm run lint`
- `npm run test:core`
- `npm run build`
- Verify no plaintext password is written by the local user repository.
- Verify connection settings reject invalid host and port values.

## Manual release checks

- Select each language before login and reload the browser.
- Verify the document direction and login labels.
- Test login with and without encrypted remember-login storage.
- Test server connection at 320px, 768px, 1024px, portrait and landscape.
- On Windows, run `windows-bootstrap-installer.ps1`, choose a custom directory, accept/decline the desktop shortcut, start the app, then run the uninstaller.
- Verify user data is preserved by default and removed only with `-PurgeData`.

The Windows workflow publishes `Fathi-Aqua-SuperERP-Windows` as an artifact after these checks.
