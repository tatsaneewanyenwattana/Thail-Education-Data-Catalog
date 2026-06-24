"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AgencySidebar from "@/components/common/AgencySidebar";
import Navbar from "@/components/common/Navbar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const { token, user, initAuth, hasHydrated } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    let active = true;
    const bootstrap = async () => {
      if (token && user) {
        if (active) setAuthReady(true);
        return;
      }
      await initAuth();
      if (active) setAuthReady(true);
    };

    void bootstrap();
    return () => {
      active = false;
    };
  }, [hasHydrated, initAuth, token, user]);

  useEffect(() => {
    if (!authReady) return;
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (user && user.role !== "agency" && user.role !== "admin") {
      router.replace(`/${locale}`);
    }
  }, [authReady, token, user, router, locale]);

  if (!hasHydrated || !authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page font-sarabun text-body-md text-text-muted">
        กำลังโหลด...
      </div>
    );
  }

  if (!token) {
    return null;
  }

  if (user && user.role !== "agency" && user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="agency" />
      <div className="flex min-h-0 flex-1">
        <AgencySidebar />
        <main className="min-w-0 flex-1 overflow-y-auto rounded-tl-2xl bg-surface-page p-6 lg:p-10 [&_aside]:hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
