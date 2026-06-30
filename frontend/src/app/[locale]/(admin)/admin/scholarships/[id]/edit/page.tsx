"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import ScholarshipForm from "@/components/scholarship/ScholarshipForm";
import type { Scholarship } from "@/hooks/useScholarships";
import apiClient from "@/services/api";

type Props = {
  params: { locale: string; id: string };
};

export default function AdminEditScholarshipPage({ params }: Props) {
  const locale = useLocale();
  const tManage = useTranslations("scholarship.manage");

  const { data, isLoading, isError } = useQuery<Scholarship>({
    queryKey: ["admin", "scholarship", params.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Scholarship }>(
        `/admin/scholarship/${params.id}`
      );
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <p className="font-sarabun text-body-md text-text-muted">
        {tManage("editLoading")}
      </p>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-sarabun text-body-md text-status-error">
          {tManage("editNotFound")}
        </p>
        <Link
          href={`/${locale}/admin/scholarships`}
          className="inline-flex font-sarabun text-label font-semibold text-primary hover:text-primary-hover"
        >
          {tManage("editBack")}
        </Link>
      </div>
    );
  }

  return (
    <ScholarshipForm
      mode="edit"
      scholarshipId={params.id}
      initialData={data}
      redirectUrl={`/${locale}/admin/scholarships`}
    />
  );
}
