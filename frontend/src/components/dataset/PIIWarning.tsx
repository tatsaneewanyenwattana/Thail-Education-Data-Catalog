"use client";

import { useTranslations } from "next-intl";
import type { PIIFinding } from "@/types/pii";

type PIIWarningProps = {
  findings: PIIFinding[];
};

const PII_TYPE_KEYS: Record<string, string> = {
  national_id: "piiTypeNationalId",
  phone: "piiTypePhone",
  email: "piiTypeEmail",
  full_name: "piiTypeFullName",
  bank_account: "piiTypeBankAccount",
  birth_date: "piiTypeBirthDate",
  religion: "piiTypeReligion",
};

export default function PIIWarning({ findings }: PIIWarningProps) {
  const t = useTranslations("agency.upload");

  const getTypeLabel = (piiType: string) => {
    const key = PII_TYPE_KEYS[piiType];
    return key ? t(key as "piiTypeNationalId") : piiType;
  };

  return (
    <div className="w-full border-2 border-status-error bg-status-error-bg px-spacing-6 py-4 text-text-primary">
      <div className="mb-3 flex items-center gap-2 font-sarabun text-label font-bold">
        <WarningIcon />
        <span>{t("piiFound", { count: findings.length })}</span>
      </div>

      <ul className="grid w-full grid-cols-1 gap-x-spacing-6 gap-y-2 sm:grid-cols-2">
        {findings.map((finding) => (
          <li
            key={`${finding.column_name}-${finding.pii_type}`}
            className="font-sarabun text-label"
          >
            <span className="font-semibold">{getTypeLabel(finding.pii_type)}</span>
            <span className="mx-2">·</span>
            <span>{t("piiRowCount", { count: finding.match_count })}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 font-sarabun text-caption">{t("piiBlockPublish")}</p>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
    </svg>
  );
}
