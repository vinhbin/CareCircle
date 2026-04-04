// LANGUAGES — shared constant for the 10 supported translation languages
// Used by: notes page (translate notes), summary page (translate summary)

export const LANGUAGES = [
  { code: 'English',    label: 'English' },
  { code: 'Tiếng Việt', label: 'Tiếng Việt' },
  { code: 'Español',    label: 'Español' },
  { code: '中文',        label: '中文' },
  { code: '한국어',      label: '한국어' },
  { code: 'Português',  label: 'Português' },
  { code: 'Tagalog',    label: 'Tagalog' },
  { code: 'हिन्दी',     label: 'हिन्दी' },
  { code: 'العربية',    label: 'العربية' },
  { code: 'Français',   label: 'Français' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']
