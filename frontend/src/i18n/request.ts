import { getRequestConfig } from "next-intl/server";

const locales = ["th", "en"] as const;
const defaultLocale = "th";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
