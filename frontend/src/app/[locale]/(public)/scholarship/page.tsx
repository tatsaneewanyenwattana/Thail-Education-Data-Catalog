import ScholarshipPageClient from "./ScholarshipPageClient";

type ScholarshipPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function ScholarshipPage({ searchParams }: ScholarshipPageProps) {
  return <ScholarshipPageClient searchParams={searchParams} />;
}
