// Single source of truth for localStorage key names — imported wherever a screen
// or service needs to read/write one, so a rename can't silently drift out of sync
// (MaintenanceScreen.jsx in particular needs to know every one of these to clear them).
export const STORAGE_KEYS = {
  CODE:       'atable_code',
  UID:        'atable_uid',
  ORGANIZER:  'atable_organizer',
  HISTORY:    'atable_history',
  GUIDE_SEEN: 'atable_guide_seen',
}
