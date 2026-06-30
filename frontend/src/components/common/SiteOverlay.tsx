"use client";

import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function SiteOverlay() {
  const { data } = useSiteSettings();

  useEffect(() => {
    if (!data) return;
    if (data.grayscale_enabled) {
      document.documentElement.style.filter = "grayscale(1)";
    } else {
      document.documentElement.style.filter = "";
    }
    return () => {
      document.documentElement.style.filter = "";
    };
  }, [data?.grayscale_enabled]);

  if (!data) return null;

  return (
    <>
      {data.ribbon_enabled && data.ribbon_image_url && (
        <div
          className="pointer-events-none fixed right-0 top-0 z-[9999]"
          aria-hidden="true"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${data.ribbon_image_url}`}
            alt=""
            className="h-20 w-20 object-contain md:h-28 md:w-28"
          />
        </div>
      )}
    </>
  );
}
