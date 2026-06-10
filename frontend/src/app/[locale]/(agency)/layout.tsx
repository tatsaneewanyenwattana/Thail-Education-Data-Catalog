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
  const { token, user, initAuth } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    void initAuth().finally(() => {
      if (active) setAuthReady(true);
    });
    return () => {
      active = false;
    };
  }, [initAuth]);

  useEffect(() => {
    if (!authReady) return;
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user && user.role !== "agency" && user.role !== "admin") {
      router.push(`/${locale}`);
    }
  }, [authReady, token, user, router, locale]);

  if (!authReady) {
    return null;
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
        <main className="min-w-0 flex-1 overflow-y-auto bg-surface-page p-6 lg:p-10 [&_aside]:hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
