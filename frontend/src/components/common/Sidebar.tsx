"use client";

type SidebarProps = {
  variant: "agency" | "admin";
};

export default function Sidebar({ variant }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 border-r border-sidebar bg-surface-card">
      <div className="p-4 font-sarabun text-label text-text-muted">
        Sidebar — placeholder ({variant})
      </div>
    </aside>
  );
}
