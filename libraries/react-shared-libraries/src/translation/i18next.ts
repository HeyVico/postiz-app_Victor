import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { fallbackLng, languages, defaultNS } from './i18n.config';
const runsOnServerSide = typeof window === 'undefined';

// BRAND_NAME white-labels the app: it replaces "Postiz" in every translated
// text. The browser gets it from the VariableContextComponent.
let brandName = runsOnServerSide ? process.env.BRAND_NAME || '' : '';
export const setBrandName = (name?: string) => {
  brandName = name || '';
};

i18next
  .use({
    type: 'postProcessor',
    name: 'brand',
    process: (value: string) =>
      brandName && typeof value === 'string'
        ? value.replace(/Postiz/g, brandName)
        : value,
  })
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: any, namespace: any) => {
      return import(`./locales/${language}/${namespace}.json`);
    })
  )
  .init({
    supportedLngs: languages,
    fallbackLng,
    lng: undefined,
    fallbackNS: defaultNS,
    defaultNS,
    detection: {
      order: ['cookie', 'header'],
    },
    preload: runsOnServerSide ? languages : [],
    postProcess: ['brand'],
  });

export default i18next;
