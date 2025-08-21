// components/IntlProvider.js
'use client'; // важно!

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';


export default function IntlProvider({ children }) {
    // инициализация только на клиенте, если нужно
    useEffect(() => {}, []);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
