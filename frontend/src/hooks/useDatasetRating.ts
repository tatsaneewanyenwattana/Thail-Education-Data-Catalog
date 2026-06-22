"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/services/api";

type RatingResponse = {
  rating_avg: number;
  rating_count: number;
};

function getCookieKey(datasetId: string): string {
  return `rated_${datasetId}`;
}

function hasVotedToday(datasetId: string): boolean {
  if (typeof document === "undefined") return false;
  const key = getCookieKey(datasetId);
  return document.cookie.split("; ").some((c) => c.startsWith(`${key}=`));
}

function setVotedCookie(datasetId: string): void {
  const key = getCookieKey(datasetId);
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  document.cookie = `${key}=1; path=/; expires=${midnight.toUTCString()}; SameSite=Lax`;
}

export function useDatasetRating(
  datasetId: string,
  initialAvg: number = 0,
  initialCount: number = 0,
) {
  const [ratingAvg, setRatingAvg] = useState(initialAvg);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [votedToday, setVotedToday] = useState(() => hasVotedToday(datasetId));

  const mutation = useMutation({
    mutationFn: async (score: number) => {
      const res = await apiClient.post<{ data: RatingResponse }>(
        `/datasets/${datasetId}/rate`,
        { score },
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      setRatingAvg(data.rating_avg);
      setRatingCount(data.rating_count);
      setVotedCookie(datasetId);
      setVotedToday(true);
    },
  });

  return {
    ratingAvg,
    ratingCount,
    votedToday,
    isRating: mutation.isPending,
    submitRating: mutation.mutate,
    error: mutation.error,
  };
}
