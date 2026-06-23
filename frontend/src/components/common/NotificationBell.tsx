"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  useMarkNotificationRead,
  useNotificationUnreadCount,
  useNotifications,
  type AppNotification,
  type NotificationType,
} from "@/hooks/useNotifications";

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function typeLabel(
  type: NotificationType,
  t: ReturnType<typeof useTranslations<"notifications">>
) {
  if (type === "announcement") return t("typeAnnouncement");
  if (type === "new_dataset") return t("typeNewDataset");
  if (type === "scholarship") return t("typeScholarship");
  return t("typeSystem");
}

function typeColor(type: NotificationType): string {
  if (type === "announcement") return "bg-status-error text-white";
  if (type === "new_dataset") return "bg-primary text-white";
  if (type === "scholarship") return "bg-status-draft text-white";
  return "bg-text-muted text-white";
}

function NotificationItem({
  item,
  locale,
  onRead,
}: {
  item: AppNotification;
  locale: string;
  onRead: (id: string) => void;
}) {
  const t = useTranslations("notifications");
  const base = `/${locale}`;
  const href = item.link ? `${base}${item.link}` : `${base}/notifications`;

  return (
    <Link
      href={href}
      onClick={() => {
        if (!item.is_read) onRead(item.id);
      }}
      className={`block border-b border-border-default/60 px-4 py-3 transition-colors hover:bg-surface-container ${
        item.is_read ? "opacity-80" : "bg-primary-light/30"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className={`rounded-radius-full px-2 py-0.5 font-sarabun text-caption font-bold ${typeColor(item.type)}`}
        >
          {typeLabel(item.type, t)}
        </span>
        {!item.is_read && (
          <span className="h-2 w-2 rounded-radius-full bg-status-error" aria-hidden />
        )}
      </div>
      <p className="font-sarabun text-label font-semibold text-text-primary">
        {item.title}
      </p>
      <p className="mt-0.5 line-clamp-2 font-sarabun text-caption text-text-secondary">
        {item.content}
      </p>
    </Link>
  );
}

export default function NotificationBell({ variant = "default" }: { variant?: "default" | "admin" }) {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const base = `/${locale}`;
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unread = 0 } = useNotificationUnreadCount();
  const { data, isLoading } = useNotifications(1, 8);
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const items = data?.items ?? [];
  const displayCount = unread > 99 ? "99+" : String(unread);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg transition-colors ${
          variant === "admin"
            ? "text-white/80 hover:bg-white/[0.10] hover:text-white"
            : "text-text-secondary hover:bg-surface-container hover:text-primary-dark"
        }`}
        aria-label={t("bellLabel")}
        aria-expanded={open}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-radius-full bg-status-error px-1 font-sarabun text-[10px] font-bold text-white">
            {displayCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-3">
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <span className="font-kanit text-label font-semibold text-text-primary">
              {t("title")}
            </span>
            <Link
              href={`${base}/notifications`}
              onClick={() => setOpen(false)}
              className="font-sarabun text-caption font-medium text-primary-dark hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>

          {isLoading && (
            <p className="px-4 py-6 font-sarabun text-body-sm text-text-muted">
              {t("loading")}
            </p>
          )}

          {!isLoading && items.length === 0 && (
            <p className="px-4 py-6 font-sarabun text-body-sm text-text-muted">
              {t("empty")}
            </p>
          )}

          {!isLoading &&
            items.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                locale={locale}
                onRead={(id) => markRead.mutate(id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
