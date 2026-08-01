import fr from './fr.js'
import en from './en.js'

const locales = { fr, en }

/** Forced to French — the app only targets French-speaking offices for now */
export function detectLang() {
  return 'fr'
}

/** Returns the translation object for the given language */
export function getTranslations(lang) {
  return locales[lang] || locales.en
}
