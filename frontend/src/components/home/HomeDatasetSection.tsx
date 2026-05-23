import Link from "next/link";
import { getTranslations } from "next-intl/server";
import DatasetCard from "@/components/dataset/DatasetCard";
import type { HomeDatasetMock } from "@/data/mockData";

type HomeDatasetSectionProps = {
  locale: string;
  variant: "popular" | "latest";
  datasets: HomeDatasetMock[];
};

export default async function HomeDatasetSection({
  locale,
  variant,
  datasets,
}: HomeDatasetSectionProps) {
  const t = await getTranslations(
    variant === "popular" ? "home.popular" : "home.latest"
  );

  const bgClass =
    variant === "popular" ? "bg-surface-page" : "bg-surface-card";

  return (
    <section className={`py-12 md:py-20 ${bgClass}`}>
      <div className="mx-auto max-w-container-max px-4 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div>
            <h2 className="font-kanit text-heading-2 text-text-primary">
              {t("title")}
            </h2>
            <p className="mt-2 font-sarabun text-body-md text-text-secondary">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/search`}
            className="inline-flex shrink-0 items-center gap-1 font-sarabun text-label font-bold text-primary hover:underline"
          >
            {t("viewAll")}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <DatasetCard key={dataset.id} {...dataset} variant={variant} />
          ))}
        </div>
      </div>
    </section>
  );
}
