"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAgencyCategories } from "@/hooks/useAgencyCategories";

const COLORS = ["#ffb74d", "#ff7043", "#4db6ac", "#26c6da", "#e84e40"];

const COLOR_RAMPS = {
  "#ffb74d": ["#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726", "#ff9800", "#fb8c00", "#f57c00", "#ef6c00"],
  "#ff7043": ["#fce4ec", "#f8bbd0", "#f48fb1", "#f06292", "#ec407a", "#e91e63", "#d81b60", "#c2185b", "#ad1457"],
  "#4db6ac": ["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c"],
  "#26c6da": ["#e0f7fa", "#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00bcd4", "#00acc1", "#0097a7", "#00838f"],
  "#e84e40": ["#fffde7", "#fff9c4", "#fff59d", "#fff176", "#ffee58", "#ffeb3b", "#fdd835", "#fbc02d", "#f9a825"],
};

type ChartCategory = {
  name: string;
  value: number;
  color: string;
};

export default function CategoryCharts() {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();
  const { data: categories = [] } = useAgencyCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const mainCategoryData = useMemo(() => {
    if (!categories.length) return { data: [], others: 0, fullList: [] };

    const sorted = [...categories].sort((a, b) => b.datasetCount - a.datasetCount);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5).reduce((sum, cat) => sum + cat.datasetCount, 0);

    const data: ChartCategory[] = top5.map((cat, idx) => ({
      name: locale === "th" ? cat.name : cat.nameEn,
      value: cat.datasetCount,
      color: COLORS[idx],
    }));

    if (others > 0) {
      data.push({ name: "อื่นๆ", value: others, color: "#e0e0e0" });
    }

    return { data, others, fullList: sorted };
  }, [categories, locale]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return mainCategoryData.fullList.find((cat) => cat.id === selectedCategoryId);
  }, [selectedCategoryId, mainCategoryData.fullList]);

  const handleMainCategoryClick = (data: any) => {
    const clickedCategory = mainCategoryData.fullList.find(
      (cat) => (locale === "th" ? cat.name : cat.nameEn) === data.name
    );
    if (clickedCategory) {
      setSelectedCategoryId(clickedCategory.id);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1 lg:grid-cols-2">
      <div>
        <h3 className="font-kanit text-heading-3-mobile font-semibold text-text-primary mb-4">
          หมวดหมู่หลัก
        </h3>
        {mainCategoryData.data.length > 0 ? (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mainCategoryData.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={handleMainCategoryClick}
                  cursor="pointer"
                >
                  {mainCategoryData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} datasets`}
                  contentStyle={{
                    backgroundColor: "var(--surface-2)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col justify-center">
        <h3 className="font-kanit text-heading-3-mobile font-semibold text-text-primary mb-4">
          {selectedCategory
            ? locale === "th"
              ? selectedCategory.name
              : selectedCategory.nameEn
            : "เลือกหมวดหมู่"}
        </h3>
        {selectedCategory ? (
          <div>
            <p className="font-sarabun text-label text-text-primary">
              {locale === "th" ? selectedCategory.name : selectedCategory.nameEn}
            </p>
            <p className="font-kanit text-3xl font-bold text-text-primary mt-2">
              {selectedCategory.datasetCount}
            </p>
            <p className="font-sarabun text-caption text-text-muted mt-2">
              Datasets
            </p>
          </div>
        ) : (
          <p className="font-sarabun text-body-md text-text-muted">คลิกที่หมวดหมู่เพื่อดูรายละเอียด</p>
        )}
      </div>
    </div>
  );
}
