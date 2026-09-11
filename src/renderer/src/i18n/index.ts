import { en, type Dict } from './en'
import { fr } from './fr'
import { createContext, useContext } from 'react'

export type Locale = 'en' | 'fr'

export function pickLocale(appLocale: string): Locale {
  return appLocale.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function getDict(locale: Locale): Dict {
  return locale === 'fr' ? fr : en
}

export const I18nContext = createContext<{ locale: Locale; t: Dict; setLocale: (l: Locale) => void }>({
  locale: 'en',
  t: en,
  setLocale: () => {}
})

export function useI18n() {
  return useContext(I18nContext)
}
