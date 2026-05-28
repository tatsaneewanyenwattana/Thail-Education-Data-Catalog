"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * เรียก initAuth ทุกครั้งที่ mount ในหน้า public
 * เพื่อตรวจสอบว่า token ใน localStorage ยังใช้งานได้หรือไม่
 * ถ้า token หมดอายุ → clear user state ทันที → ปุ่ม Bookmark จะถูกซ่อน
 */
export default function AuthInitializer() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  return null;
}
