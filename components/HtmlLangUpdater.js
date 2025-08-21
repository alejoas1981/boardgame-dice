'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function HtmlLangUpdater() {
    const { i18n } = useTranslation();

    useEffect(() => {
        if (!i18n || !i18n.language) return; // ждем инициализации
        document.documentElement.lang = i18n.language;
    }, [i18n.language, i18n]);

    return null;
}
