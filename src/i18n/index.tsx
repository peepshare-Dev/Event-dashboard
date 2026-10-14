// EN / TH language support.
//
// English text is the key: write `t('Create Event')` in components, and add the Thai to a dictionary
// in `./th/`. Anything missing from the dictionary falls back to English, so untranslated text still shows.
// Placeholders: `t('{count} selected', { count: 3 })`.
// Same English, different meaning: prefix a context, `t('[verb] Schedule')` → "Schedule" / "ตั้งเวลา".

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { th } from './th';

export type Lang = 'en' | 'th';

export const LANGUAGES: { value: Lang; label: string; short: string }[] = [
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'th', label: 'ภาษาไทย', short: 'TH' },
];

type Vars = Record<string, string | number>;

const STORAGE_KEY = 'peepshare.lang';

/** Translates outside React (e.g. in a helper that already knows the language). */
export function translate(lang: Lang, text: string, vars?: Vars): string {
  // "[context] Text" lets one English word have different Thai (e.g. "[verb] Schedule"); English shows just "Text".
  const english = text.replace(/^\[[^\]]+\] /, '');
  const s = lang === 'th' ? (th[text] ?? english) : english;
  return vars ? s.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match)) : s;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({ lang: 'en', setLang: () => {} });

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'th' || stored === 'en' ? stored : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be blocked; the choice still applies for this visit.
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Current language and a setter (for the header switch). */
export function useLanguage() {
  return useContext(LanguageContext);
}

/** `t('English text', vars?)` in the current language. */
export function useT() {
  const { lang } = useContext(LanguageContext);
  return useCallback((text: string, vars?: Vars) => translate(lang, text, vars), [lang]);
}
