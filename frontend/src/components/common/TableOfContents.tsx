"use client";

import { useEffect, useState } from "react";

export type TocSection = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  sections: TocSection[];
  className?: string;
};

export default function TableOfContents({
  sections,
  className = "",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-10% 0px -80% 0px",
        threshold: 0,
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      className={`flex flex-col space-y-1 ${className}`}
      aria-label="Table of contents"
    >
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`border-l-[3px] px-4 py-3 font-sarabun text-label transition-all hover:bg-surface-container ${
              isActive
                ? "border-primary-dark bg-primary-light/50 font-medium text-primary-dark"
                : "border-transparent text-text-secondary hover:text-primary-dark"
            }`}
          >
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
