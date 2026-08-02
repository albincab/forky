// Shared access password gating the whole app (see PasswordGateScreen.jsx / App.jsx).
// Single source of truth so every generated invite link (copy link, Teams message,
// QR code, share button) can carry it as ?pwd=, not just the manual entry screen.
// Same trade-off as MAINTENANCE_TOKEN in App.jsx: ships in the public JS bundle,
// not real security — just an access barrier for an informal/internal prototype.
export const APP_PASSWORD = 'Glacons+3Prosecco+2Aperol+1Orange=SPRITZ@2026'
