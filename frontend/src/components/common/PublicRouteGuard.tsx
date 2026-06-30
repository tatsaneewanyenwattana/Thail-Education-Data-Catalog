"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function PublicRouteGuard() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "th";
  const { token, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !user) return;

    if (user.role === "admin") {
      router.replace(`/${locale}/admin`);
    } else if (user.role === "agency") {
      router.replace(`/${locale}/dashboard`);
    }
  }, [hasHydrated, token, user, router, locale]);

  return null;
}
