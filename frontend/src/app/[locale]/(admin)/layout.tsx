"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const { token, user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }

    if (user && user.role !== "admin") {
      router.replace(`/${locale}`);
    }
  }, [token, user, router, locale]);

  if (!token) {
    return null;
  }

  if (user && user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="admin" />
      <div className="flex flex-1">
        <Sidebar variant="admin" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
