"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

type PageViewCounts = { today: number; total: number };

export function usePageView(pageName: string) {
  const [counts, setCounts] = useState<PageViewCounts>({ today: 0, total: 0 });

  useEffect(() => {
    if (!pageName) return;

    fetch(`${API}/page-views?page=${pageName}`, { method: "POST" }).catch(() => {});

    fetch(`${API}/page-views?page=${pageName}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success") setCounts(res.data);
      })
      .catch(() => {});
  }, [pageName]);

  return counts;
}
