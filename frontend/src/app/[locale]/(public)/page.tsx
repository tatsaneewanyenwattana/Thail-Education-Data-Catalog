import Banner from "@/components/common/Banner";
import HeroSearch from "@/components/common/HeroSearch";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import HomeDatasetSection from "@/components/home/HomeDatasetSection";
import {
  MOCK_LATEST_DATASETS,
  MOCK_POPULAR_DATASETS,
} from "@/data/mockData";

type HomePageProps = {
  params: { locale: string };
};

export default function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <>
      <Banner />
      <HeroSearch />
      <HomeDatasetSection
        locale={locale}
        variant="popular"
        datasets={MOCK_POPULAR_DATASETS}
      />
      <HomeDatasetSection
        locale={locale}
        variant="latest"
        datasets={MOCK_LATEST_DATASETS}
      />
      <HomeCtaSection locale={locale} />
    </>
  );
}
