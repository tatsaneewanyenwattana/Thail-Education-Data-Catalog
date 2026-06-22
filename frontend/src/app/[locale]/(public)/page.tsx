import AnnouncementBanner from "@/components/common/AnnouncementBanner";
import HeroSearch from "@/components/common/HeroSearch";
import StatsOverview from "@/components/common/StatsOverview";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import HomeDatasetSectionClient from "@/components/home/HomeDatasetSectionClient";
import HomeScholarshipSectionClient from "@/components/home/HomeScholarshipSectionClient";

type HomePageProps = {
  params: { locale: string };
};

export default function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <>
      <AnnouncementBanner />
      <HeroSearch />
      <section className="py-10 md:py-14">
        <div className="mx-auto flex max-w-container-max justify-center px-4 md:px-10">
          <StatsOverview />
        </div>
      </section>
      <HomeDatasetSectionClient locale={locale} variant="popular" />
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-container-max px-4 md:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <HomeDatasetSectionClient locale={locale} variant="latest" embedded />
            </div>
            <div>
              <HomeScholarshipSectionClient locale={locale} embedded />
            </div>
          </div>
        </div>
      </section>
      <HomeCtaSection locale={locale} />
    </>
  );
}
