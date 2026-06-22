"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useDatasetRating } from "@/hooks/useDatasetRating";
import { useAuthStore } from "@/stores/useAuthStore";

type DatasetRatingProps = {
  datasetId: string;
  isPublished: boolean;
  initialAvg?: number;
  initialCount?: number;
  viewCount?: number;
};

function StarDisplay({ count, size = "text-xl" }: { count: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`${size} leading-none ${i <= count ? "text-amber-400" : "text-text-muted/30"}`}>
          {i <= count ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export default function DatasetRating({
  datasetId,
  isPublished,
  initialAvg = 0,
  initialCount = 0,
  viewCount = 0,
}: DatasetRatingProps) {
  const t = useTranslations("dataset");
  const locale = useLocale();
  const { user } = useAuthStore();
  const isLoggedIn = !!user;
  const canVote = isPublished && !isLoggedIn;

  const { ratingAvg, ratingCount, votedToday, isRating, submitRating } =
    useDatasetRating(datasetId, initialAvg, initialCount);

  const [hoverRating, setHoverRating] = useState(0);
  const [showVoteStars, setShowVoteStars] = useState(false);
  const numberLocale = locale === "th" ? "th-TH" : "en-US";
  const filledStars = ratingAvg < 0.5 ? 0 : ratingAvg < 1.5 ? 1 : ratingAvg < 2.5 ? 2 : ratingAvg < 3.5 ? 3 : ratingAvg < 4.5 ? 4 : 5;

  return (
    <div className="flex w-full flex-col items-end gap-2 md:ml-auto md:w-auto">
      {/* ── แถบหลัก: คะแนน | ดาว | ผู้เข้าชม | ปุ่มโหวต ── */}
      <div className="inline-flex items-center gap-4 rounded-radius-full border border-primary/30 bg-primary-light/40 px-6 py-3">
        <span className="font-kanit text-heading-3-mobile font-bold text-primary-dark">
          {ratingAvg.toFixed(2)}
        </span>

        <StarDisplay count={filledStars} size="text-2xl" />

        <span className="text-lg text-primary/30">|</span>

        <span className="flex items-center gap-1.5 font-sarabun text-label font-medium text-primary-dark">
          {viewCount.toLocaleString(numberLocale)}
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </span>

        {canVote && !votedToday && (
          <button
            type="button"
            onClick={() => setShowVoteStars((v) => !v)}
            className="rounded-radius-full bg-primary px-5 py-1.5 font-sarabun text-label font-bold text-white transition-colors hover:bg-primary-dark"
          >
            {t("rateButton")}
          </button>
        )}

        {votedToday && (
          <span className="rounded-radius-full bg-primary/20 px-4 py-1.5 font-sarabun text-label font-medium text-primary-dark">
            ✓ {t("ratedToday")}
          </span>
        )}
      </div>

      {/* ── ดาวสำหรับกดโหวต (เปิดเมื่อกดปุ่มโหวต) ── */}
      {showVoteStars && canVote && !votedToday && (
        <div className="inline-flex items-center gap-1 rounded-radius-lg border border-primary/20 bg-surface-card px-5 py-3 shadow-level-1">
          {isRating ? (
            <span className="font-sarabun text-label font-medium text-text-muted">
              {t("ratingSaving")}
            </span>
          ) : (
            <>
              <span className="mr-2 font-sarabun text-label text-text-secondary">
                {t("ratePrompt")}
              </span>
              {[1, 2, 3, 4, 5].map((i) => {
                const filled = i <= (hoverRating || 0);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isRating}
                    className={`min-h-[40px] min-w-[40px] text-3xl leading-none transition-colors disabled:opacity-50 ${
                      filled ? "text-amber-400" : "text-text-muted/40"
                    }`}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => submitRating(i)}
                    aria-label={`${i}`}
                  >
                    {filled ? "★" : "☆"}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
