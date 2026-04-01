import fr from './fr.js'
import en from './en.js'

const locales = { fr, en }

/** Detects browser language, falls back to English */
export function detectLang() {
  const browserLang = navigator.language?.slice(0, 2).toLowerCase()
  return browserLang === 'fr' ? 'fr' : 'en'
}

/** Returns the translation object for the given language */
export function getTranslations(lang) {
  return locales[lang] || locales.en
}
