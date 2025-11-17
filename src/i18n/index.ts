import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import tr from './locales/tr.json';

const LANGUAGE_KEY = '@app_language';

// Desteklenen diller
const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

// Cihaz dilini veya kaydedilmiş dili al
const getDeviceLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
      return savedLanguage;
    }
  } catch (error) {
    console.error('Error reading language from storage:', error);
  }

  // Kaydedilmiş dil yoksa cihaz dilini kontrol et
  const deviceLocales = RNLocalize.getLocales();
  const deviceLanguage = deviceLocales[0]?.languageCode || 'tr';
  
  return deviceLanguage === 'en' ? 'en' : 'tr';
};

// i18n'i initialize et
const initI18n = async () => {
  const language = await getDeviceLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'tr',
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
    });
};

// Dil değiştirme fonksiyonu
export const changeLanguage = async (language: 'en' | 'tr') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Mevcut dili al
export const getCurrentLanguage = (): string => {
  return i18n.language || 'tr';
};

// Initialize i18n
initI18n();

export default i18n;

