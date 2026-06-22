import Link from "next/link";
import { getTranslations } from "next-intl/server";

type HomeCtaSectionProps = {
  locale: string;
};

export default async function HomeCtaSection({ locale }: HomeCtaSectionProps) {
  const t = await getTranslations("home.cta");

  return (
    <section className="px-4 py-12 md:px-10 md:py-16">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-surface-navy p-8 md:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-radius-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10">
            <h3 className="font-kanit text-heading-2 text-white">
              {t("title")}
            </h3>
            <p className="mt-3 font-sarabun text-body-md text-white/75">
              {t("subtitle")}
            </p>
            <Link
              href={`/${locale}/register`}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg px-8 font-sarabun text-label font-bold transition-colors"
              style={{ backgroundColor: "white", color: "#33691e" }}
            >
              {t("register")}
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-8 md:p-10" style={{ backgroundColor: "#f5f5f5" }}>
          <div className="relative z-10">
            <h3 className="font-kanit text-heading-2 text-text-primary">
              {t("manualTitle")}
            </h3>
            <p className="mt-3 font-sarabun text-body-md text-text-secondary">
              {t("manualSubtitle")}
            </p>
            <Link
              href={`/${locale}/api-docs`}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg px-8 font-sarabun text-label font-bold text-white transition-colors"
              style={{ backgroundColor: "#33691e" }}
            >
              {t("manual")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
