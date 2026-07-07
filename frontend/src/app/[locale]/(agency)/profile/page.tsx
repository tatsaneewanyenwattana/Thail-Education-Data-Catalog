"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import apiClient from "@/services/api";
import LoginHistoryTable from "@/components/profile/LoginHistoryTable";

type MeProfile = {
  id: string;
  email: string;
  role: string;
  status: string;
  agency_name: string | null;
  agency_type: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  image_url: string | null;
};

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-12 rounded-2xl bg-surface-container" />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("agency.profile");
  const locale = useLocale();
  const base = `/${locale}`;
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [agencyName, setAgencyName] = useState("");
  const [agencyType, setAgencyType] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["auth", "me", "profile"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      const me = (response.data as { data?: MeProfile }).data;
      if (!me) throw new Error(t("loadError"));
      return me;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, string | null>) => {
      const res = await apiClient.patch("/auth/me", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me", "profile"] });
      setEditing(false);
    },
  });

  const imageMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      await apiClient.post("/auth/me/image", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me", "profile"] });
      setSelectedImage(null);
    },
  });

  const startEdit = () => {
    if (!data) return;
    setAgencyName(data.agency_name ?? "");
    setAgencyType(data.agency_type ?? "");
    setContactName(data.contact_name ?? "");
    setContactPhone(data.contact_phone ?? "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleSave = () => {
    updateMutation.mutate({
      agency_name: agencyName || null,
      agency_type: agencyType || null,
      contact_name: contactName || null,
      contact_phone: contactPhone || null,
    });
    if (selectedImage) {
      imageMutation.mutate(selectedImage);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const getAgencyTypeLabel = (agencyType: string | null) => {
    if (!agencyType) return "—";
    const key = `agencyType_${agencyType}` as
      | "agencyType_central"
      | "agencyType_regional"
      | "agencyType_local"
      | "agencyType_educational"
      | "agencyType_other";
    if (
      key === "agencyType_central" ||
      key === "agencyType_regional" ||
      key === "agencyType_local" ||
      key === "agencyType_educational" ||
      key === "agencyType_other"
    ) {
      return t(key);
    }
    return agencyType;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      email_unverified: t("status_email_unverified"),
      pending: t("status_pending"),
      active: t("status_active"),
      rejected: t("status_rejected"),
      suspended: t("status_suspended"),
    };
    return statusLabels[status] ?? status;
  };

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const profileImageUrl = imagePreview
    ? imagePreview
    : data?.image_url
      ? `${apiBase}${data.image_url}?t=${Date.now()}`
      : null;

  const inputClass =
    "h-11 w-full rounded-full border border-border-input bg-surface-card px-5 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-border-default bg-surface-card shadow-level-1">
        {isLoading ? (
          <div className="p-8">
            <ProfileSkeleton />
          </div>
        ) : isError ? (
          <div className="p-8">
            <p className="font-sarabun text-body-md text-status-error">
              {error instanceof Error ? error.message : t("loadError")}
            </p>
          </div>
        ) : (
          <>
            {/* Profile header with image */}
            <div className="flex items-center gap-6 border-b border-border-default/30 px-8 py-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-light">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-10 w-10 text-primary-dark" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#0d5302] text-white shadow-level-1 hover:opacity-90"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.33a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
                    </svg>
                  </button>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
              <div className="flex-1">
                <h2 className="font-kanit text-heading-2 font-bold text-text-primary">
                  {data?.agency_name ?? "—"}
                </h2>
                <p className="font-sarabun text-label text-text-muted">
                  {data?.email}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-0.5 font-sarabun text-caption font-semibold ${
                    data?.status === "active"
                      ? "bg-status-published-bg text-status-published"
                      : "bg-surface-container text-text-muted"
                  }`}
                >
                  {getStatusLabel(data?.status ?? "")}
                </span>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-border-input px-5 py-2.5 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.33a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
                  </svg>
                  แก้ไข
                </button>
              )}
            </div>

            {/* Profile fields */}
            <div className="divide-y divide-border-default/20 px-8">
              <ProfileField label={t("agencyName")} value={data?.agency_name ?? "—"} editing={editing}>
                <input className={inputClass} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
              </ProfileField>
              <ProfileField label={t("agencyType")} value={getAgencyTypeLabel(data?.agency_type ?? null)} editing={editing}>
                <select
                  className={inputClass}
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value)}
                >
                  <option value="">— เลือก —</option>
                  <option value="central">ส่วนกลาง</option>
                  <option value="regional">ส่วนภูมิภาค</option>
                  <option value="local">ส่วนท้องถิ่น</option>
                  <option value="educational">สถาบันการศึกษา</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </ProfileField>
              <ProfileField label={t("contactName")} value={data?.contact_name ?? "—"} editing={editing}>
                <input className={inputClass} value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </ProfileField>
              <ProfileField label={t("contactPhone")} value={data?.contact_phone ?? "—"} editing={editing}>
                <input className={inputClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="0x-xxx-xxxx" />
              </ProfileField>
            </div>

            {/* Save/Cancel buttons */}
            {editing && (
              <div className="flex justify-end gap-3 border-t border-border-default/30 px-8 py-5">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full border border-border-input px-6 py-2.5 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="rounded-full bg-[#0d5302] px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            )}

            {updateMutation.isError && (
              <div className="mx-8 mb-4 rounded-2xl border border-status-error/30 bg-status-error-bg px-4 py-3 font-sarabun text-caption text-status-error">
                บันทึกไม่สำเร็จ กรุณาลองใหม่
              </div>
            )}
          </>
        )}
      </section>

      {/* Login history toggle */}
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex w-full items-center justify-between rounded-2xl border border-border-default bg-surface-card px-6 py-4 shadow-level-1 transition-colors hover:bg-surface-container"
        >
          <div className="text-left">
            <h2 className="font-kanit text-heading-2 text-text-primary">
              ประวัติการเข้าสู่ระบบ
            </h2>
            <p className="mt-0.5 font-sarabun text-caption text-text-muted">
              รายการการเข้าสู่ระบบล่าสุดของบัญชีนี้
            </p>
          </div>
          <svg
            className={`h-5 w-5 text-text-muted transition-transform ${showHistory ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </button>
        {showHistory && <LoginHistoryTable />}
      </section>

      {/* Delete account button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 rounded-full border border-status-error px-6 py-2.5 font-sarabun text-label font-medium text-status-error transition-colors hover:bg-status-error-bg"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
          {t("deleteAccount")}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl bg-surface-card p-8 shadow-level-3">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-status-error-bg">
              <svg className="h-7 w-7 text-status-error" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h3 className="font-kanit text-xl font-bold text-text-primary">
              ต้องการลบบัญชีหรือไม่?
            </h3>
            <p className="mt-2 font-sarabun text-body-md text-text-muted">
              การลบบัญชีจะไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดจะถูกลบออกจากระบบ
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full border border-border-input px-6 py-2.5 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
              >
                ยกเลิก
              </button>
              <Link
                href={`${base}/profile/delete`}
                className="inline-flex items-center rounded-full bg-status-error px-6 py-2.5 font-sarabun text-label font-medium text-white transition-opacity hover:opacity-90"
                onClick={() => setShowDeleteModal(false)}
              >
                ดำเนินการลบ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileField({
  label,
  value,
  editing,
  children,
}: {
  label: string;
  value: string;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-5 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
      <dt className="font-sarabun text-label font-medium text-text-secondary">
        {label}
      </dt>
      <dd className="font-sarabun text-body-md text-text-primary">
        {editing ? children : value}
      </dd>
    </div>
  );
}
