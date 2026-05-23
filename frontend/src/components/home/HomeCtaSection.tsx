import Link from "next/link";
import { getTranslations } from "next-intl/server";

type HomeCtaSectionProps = {
  locale: string;
};

export default async function HomeCtaSection({ locale }: HomeCtaSectionProps) {
  const t = await getTranslations("home.cta");

  return (
    <section className="px-4 py-12 md:px-10 md:py-16">
      <div className="relative mx-auto flex max-w-container-max flex-col items-center justify-between gap-8 overflow-hidden rounded-radius-xl bg-surface-navy p-8 md:flex-row md:p-12">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-radius-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h2 className="font-kanit text-heading-1 text-white">{t("title")}</h2>
          <p className="mt-4 font-sarabun text-body-lg text-white/80">
            {t("subtitle")}
          </p>
        </div>
        <div className="relative z-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center md:w-auto">
          <Link
            href={`/${locale}/register`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-radius-lg bg-primary px-8 font-sarabun text-label font-bold text-white shadow-level-2 transition-colors hover:bg-primary-hover"
          >
            {t("register")}
          </Link>
          <Link
            href={`/${locale}/privacy-policy`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-radius-lg border border-white/30 px-8 font-sarabun text-label font-bold text-white transition-colors hover:bg-white/10"
          >
            {t("manual")}
          </Link>
        </div>
      </div>
    </section>
  );
}
