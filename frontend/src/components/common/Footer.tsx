import Link from "next/link";
import { getTranslations } from "next-intl/server";

type FooterProps = {
  locale: string;
};

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  const base = `/${locale}`;

  const exploreLinks = [
    { href: `${base}/search`, label: t("catalog") },
    { href: `${base}/stats`, label: t("dashboard") },
    { href: `${base}/search`, label: t("apiDocs") },
    { href: `${base}/privacy-policy`, label: t("dataStandards") },
  ];

  const aboutLinks = [
    { href: `${base}/privacy-policy`, label: t("openDataPolicy") },
    { href: `${base}/privacy-policy`, label: t("privacy") },
    { href: `${base}/privacy-policy`, label: t("terms") },
    { href: `${base}/privacy-policy`, label: t("contact") },
  ];

  const agencyLinks = [
    { href: "#", label: t("moe") },
    { href: "#", label: t("budgetBureau") },
    { href: "#", label: t("dga") },
    { href: "#", label: t("nso") },
  ];

  return (
    <footer className="border-t border-white/10 bg-surface-navy pt-12 text-white/80 md:pt-16">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-8 px-4 pb-12 md:grid-cols-4 md:gap-6 md:px-10 md:pb-16">
        <div>
          <h3 className="mb-4 font-kanit text-heading-3-mobile font-bold text-white md:text-heading-3">
            Thai EduData Insight
          </h3>
          <p className="mb-6 font-sarabun text-label leading-relaxed">
            {t("tagline")}
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-white/80 transition-colors hover:text-white"
              aria-label={t("socialFacebook")}
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-white/80 transition-colors hover:text-white"
              aria-label={t("socialEmail")}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-kanit text-caption font-bold uppercase tracking-widest text-white">
            {t("exploreTitle")}
          </h4>
          <ul className="space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-sarabun text-label transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-kanit text-caption font-bold uppercase tracking-widest text-white">
            {t("aboutTitle")}
          </h4>
          <ul className="space-y-3">
            {aboutLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-sarabun text-label transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-kanit text-caption font-bold uppercase tracking-widest text-white">
            {t("agenciesTitle")}
          </h4>
          <ul className="space-y-3">
            {agencyLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-sarabun text-label transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 font-sarabun text-caption md:flex-row md:px-10 md:py-8">
        <p>{t("copyright", { year })}</p>
        <p className="flex items-center gap-2 text-center">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          {t("poweredBy")}
        </p>
      </div>
    </footer>
  );
}
