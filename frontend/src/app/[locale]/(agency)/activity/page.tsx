"use client";

import { useLocale, useTranslations } from "next-intl";
import { useAgencyActivityLogs } from "@/hooks/useAgencyActivityLogs";

function mapActionLabel(action: string, t: ReturnType<typeof useTranslations<"agency.activity">>) {
  const value = action.toLowerCase();
  if (value.includes("upload")) return t("actionUpload");
  if (value.includes("update")) return t("actionUpdate");
  if (value.includes("delete")) return t("actionDelete");
  if (value.includes("submit")) return t("actionSubmit");
  return t("actionOther");
}

export default function AgencyActivityPage() {
  const t = useTranslations("agency.activity");
  const locale = useLocale();
  const { data, isLoading, isError, error } = useAgencyActivityLogs(1, 50);

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">{t("title")}</h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">{t("subtitle")}</p>
      </header>

      {isError ? (
        <div className="rounded-radius-lg border border-status-error/30 bg-status-error/5 px-4 py-3 font-sarabun text-label text-status-error">
          {error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ"}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container font-sarabun text-label font-semibold text-text-secondary">
                <th className="px-6 py-4">{t("colDateTime")}</th>
                <th className="px-6 py-4">{t("colAction")}</th>
                <th className="px-6 py-4">{t("colDataset")}</th>
                <th className="px-6 py-4">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-6 font-sarabun text-label text-text-muted" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 font-sarabun text-label text-text-muted" colSpan={4}>
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.created_at}-${item.action}-${item.target_id ?? "none"}`}>
                    <td className="px-6 py-3 font-sarabun text-label text-text-muted">
                      {new Date(item.created_at).toLocaleString(
                        locale === "th" ? "th-TH" : "en-US"
                      )}
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-text-primary">
                      {mapActionLabel(item.action, t)}
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-text-primary">
                      {item.dataset_title ?? "-"}
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-primary-dark">
                      {t("statusSuccess")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
