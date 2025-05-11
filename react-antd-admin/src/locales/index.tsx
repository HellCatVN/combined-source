import translation_en from '@locales/en/translation.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  supportedLngs: ['en', 'vi'],
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  lng: 'en',
  ns: ['translation'],
  resources: {
    en: {
      translation: translation_en,
    },
  },
});

export default i18n;
