"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAgencyCategoryTree } from "@/hooks/useAgencyCategories";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";

const COLORS = ["#1565c0", "#0277bd", "#00838f", "#00695c", "#2e7d32"];

type ChartCategory = {
  name: string;
  value: number;
  color: string;
  id: string;
};

export default function CategoryCharts() {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();
  const { data: treeData } = useAgencyCategoryTree();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const roots = treeData?.tree ?? [];

  const mainCategoryData = useMemo(() => {
    if (!roots.length) return [];

    const sorted = [...roots].sort((a, b) => b.datasetCount - a.datasetCount);
    const top5 = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((sum, cat) => sum + cat.datasetCount, 0);

    const data: ChartCategory[] = top5.map((cat, idx) => ({
      id: cat.id,
      name: locale === "th" ? cat.nameTh : cat.nameEn,
      value: cat.datasetCount,
      color: COLORS[idx % COLORS.length],
    }));

    if (othersCount > 0) {
      data.push({ id: "__others__", name: locale === "th" ? "อื่นๆ" : "Others", value: othersCount, color: "#bdbdbd" });
    }

    return data;
  }, [roots, locale]);

  const selectedNode: CategoryTreeNode | null = useMemo(() => {
    if (!selectedId) return null;
    return roots.find((r) => r.id === selectedId) ?? null;
  }, [selectedId, roots]);

  const subCategories = useMemo(() => {
    if (!selectedNode || selectedNode.children.length === 0) return [];
    const total = selectedNode.children.reduce((sum, c) => sum + c.datasetCount, 0);
    return selectedNode.children
      .filter((c) => c.datasetCount > 0)
      .sort((a, b) => b.datasetCount - a.datasetCount)
      .map((c) => ({
        name: locale === "th" ? c.nameTh : c.nameEn,
        count: c.datasetCount,
        percent: total > 0 ? Math.round((c.datasetCount / total) * 100) : 0,
      }));
  }, [selectedNode, locale]);

  const handleClick = (data: any) => {
    const found = mainCategoryData.find((d) => d.name === data.name);
    if (found && found.id !== "__others__") {
      setSelectedId(found.id);
    }
  };

  const selectedColor = useMemo(() => {
    if (!selectedId) return COLORS[0];
    return mainCategoryData.find((d) => d.id === selectedId)?.color ?? COLORS[0];
  }, [selectedId, mainCategoryData]);

  return (
    <div className="self-start rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="font-kanit text-[15px] font-semibold text-text-primary mb-0.5">
        หมวดหมู่หลัก
      </h3>
      <p className="font-sarabun text-xs text-text-muted mb-3">
        สัดส่วน dataset ตามหมวดหมู่
      </p>
      {mainCategoryData.length > 0 ? (
        <>
          <div className="flex items-center gap-4">
            <div style={{ width: 120, height: 120 }} className="flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mainCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={handleClick}
                    cursor="pointer"
                  >
                    {mainCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedId === entry.id ? "#fff" : "none"}
                        strokeWidth={selectedId === entry.id ? 3 : 0}
                      />
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
            <div className="flex flex-col gap-1.5">
              {mainCategoryData.map((cat) => (
                <button
                  key={cat.id}
                  className="flex items-center gap-2 font-sarabun text-xs text-text-muted hover:text-text-primary transition-colors text-left"
                  onClick={() => cat.id !== "__others__" && setSelectedId(cat.id)}
                >
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {selectedNode && (
            <div className="mt-3 border-t border-border-default/40 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-kanit text-xs font-semibold text-text-primary">
                    {locale === "th" ? selectedNode.nameTh : selectedNode.nameEn}
                  </h4>
                  <p className="font-sarabun text-[11px] text-text-muted">
                    {selectedNode.datasetCount} datasets
                  </p>
                </div>
                <button
                  className="font-sarabun text-xs text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => setSelectedId(null)}
                >
                  ✕
                </button>
              </div>

              {subCategories.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {subCategories.map((sub) => (
                    <div key={sub.name}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-sarabun text-[11px] text-text-primary truncate mr-2">{sub.name}</span>
                        <span className="font-sarabun text-[11px] font-semibold text-text-muted flex-shrink-0">
                          {sub.percent}% ({sub.count})
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-surface-container">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${sub.percent}%`, backgroundColor: selectedColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sarabun text-[11px] text-text-muted">ไม่มีหมวดหมู่ย่อย</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="font-sarabun text-xs text-text-muted">ไม่มีข้อมูลหมวดหมู่</p>
      )}
    </div>
  );
}
