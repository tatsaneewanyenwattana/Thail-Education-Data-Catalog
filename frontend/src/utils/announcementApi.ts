import type { Announcement, AnnouncementInput } from "@/data/mockData";

export type ApiAnnouncement = {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export function mapAnnouncement(item: ApiAnnouncement): Announcement {
  return {
    id: String(item.id),
    title: item.title,
    content: item.content,
    isActive: item.is_active,
    createdAt: item.created_at,
  };
}

export function toAnnouncementCreateBody(input: AnnouncementInput) {
  return {
    title: input.title,
    content: input.content,
    is_active: input.isActive,
  };
}

export function toAnnouncementUpdateBody(input: AnnouncementInput) {
  return {
    title: input.title,
    content: input.content,
    is_active: input.isActive,
  };
}
