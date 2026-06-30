import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AppProviders } from "@/providers/AppProviders";
import { RoleThemeProvider } from "@/providers/RoleThemeProvider";
import SiteOverlay from "@/components/common/SiteOverlay";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang='${locale}';if(!document.documentElement.getAttribute('data-role')){document.documentElement.setAttribute('data-role','visitor');}`,
        }}
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <RoleThemeProvider />
        <AppProviders>
          <SiteOverlay />
          {children}
        </AppProviders>
      </NextIntlClientProvider>
    </>
  );
}
