"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

type ActivityItem = {
  id: string;
  action: string;
  itemType: string;
  createdAt: string;
  detail?: Record<string, any>;
};

const ACTION_COLORS: Record<string, string> = {
  upload: "#42bd41",
  "bulk_upload": "#42bd41",
  update: "#29b6f6",
  draft: "#ffb74d",
  delete: "#d01716",
};

const ACTION_LABELS: Record<string, string> = {
  upload: "อัปโหลด",
  "bulk_upload": "อัปโหลดหลายอัน",
  update: "แก้ไข",
  draft: "บันทึกแบบร่าง",
  delete: "ลบ",
};

function getActivityType(action: string): string {
  const actionMap: Record<string, string> = {
    "dataset.upload": "upload",
    "dataset.bulk_upload": "bulk_upload",
    "dataset.update": "update",
    "dataset.delete": "delete",
    "scholarship.create": "upload",
    "scholarship.update": "update",
    "scholarship.delete": "delete",
  };
  return actionMap[action] || "update";
}

async function fetchActivityLogs(): Promise<ActivityItem[]> {
  const res = await apiClient.get<{ data: ActivityItem[] }>("/agency/activity-logs?page=1&page_size=5");
  return res.data?.data || [];
}

export default function ActivityLog() {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();
  const { data: activities = [] } = useQuery({
    queryKey: ["agency", "activity-logs"],
    queryFn: fetchActivityLogs,
    staleTime: 1000 * 60 * 2,
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "เมื่อ 1 นาทีที่แล้ว";
    if (hours < 24) return `เมื่อ ${hours} ชั่วโมงที่แล้ว`;
    if (days === 1) return "เมื่อวาน";
    if (days < 7) return `${days} วันที่แล้ว`;
    return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US");
  };

  return (
    <div className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
      <h3 className="font-kanit text-heading-3-mobile font-semibold text-text-primary mb-4">
        กิจกรรมล่าสุด
      </h3>
      <div className="flex flex-col gap-3">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const actType = getActivityType(activity.action);
            const color = ACTION_COLORS[actType] || "#888888";
            const label = ACTION_LABELS[actType] || activity.action;
            return (
              <div key={activity.id} className="flex gap-3 border-b border-border-default/20 pb-3 last:border-b-0">
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sarabun text-label text-text-primary">
                    {label} {activity.itemType === "dataset" ? "Dataset" : "ทุนการศึกษา"}
                  </p>
                  <p className="font-sarabun text-caption text-text-muted mt-1">
                    {formatTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="font-sarabun text-body-md text-text-muted">ไม่มีกิจกรรม</p>
        )}
      </div>
    </div>
  );
}
