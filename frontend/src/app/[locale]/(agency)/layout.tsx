"use client";

import { useEffect } from "react";
import AgencySidebar from "@/components/common/AgencySidebar";
import Navbar from "@/components/common/Navbar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // TODO: เปิด Auth Guard เมื่อ Backend พร้อม
  // ตอนนี้ bypass ไว้ก่อนเพื่อทดสอบ UI
  // useEffect(() => {
  //   if (!token) {
  //     router.replace(`/${locale}/login`);
  //     return;
  //   }
  //
  //   if (user && user.role !== "agency" && user.role !== "admin") {
  //     router.replace(`/${locale}`);
  //   }
  // }, [token, user, router, locale]);

  // if (!token) {
  //   return null;
  // }

  // if (user && user.role !== "agency" && user.role !== "admin") {
  //   return null;
  // }

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
