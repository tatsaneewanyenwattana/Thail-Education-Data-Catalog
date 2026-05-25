"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/common/AdminSidebar";
import Navbar from "@/components/common/Navbar";
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
    void initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user && user.role !== "admin") {
      router.push(`/${locale}`);
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
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-surface-page p-6 lg:p-10 [&_aside]:hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
