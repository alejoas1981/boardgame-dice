import './globals.css';
import IntlProvider from '@/components/IntlProvider';
import HtmlLangUpdater from '@/components/HtmlLangUpdater';

export const metadata = {
    title: 'Кости для Монополии - Онлайн помощник',
    description: 'Многопользовательское приложение для бросания костей в игре Монополия',
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
        <body className="antialiased">
        <IntlProvider>
            {children}
        </IntlProvider>
        </body>
        </html>
    );
}