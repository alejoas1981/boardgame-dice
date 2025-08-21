import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ru from './messages/ru.json';
import en from './messages/en.json';
import es from './messages/es.json';
import ua from './messages/ua.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ru },
            en: { translation: en },
            es: { translation: es },
            ua: { translation: ua },
        },
        fallbackLng: 'ru', // Default language
        interpolation: { escapeValue: false },
    });

export default i18n;