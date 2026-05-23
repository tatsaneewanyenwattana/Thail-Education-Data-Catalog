import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AppProviders } from "@/providers/AppProviders";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sarabun bg-surface-page">
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
