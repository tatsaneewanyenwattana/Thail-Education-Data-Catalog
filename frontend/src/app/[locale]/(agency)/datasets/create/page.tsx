"use client";

import DatasetForm from "@/components/dataset/DatasetForm";

export default function CreateDatasetPage() {
  return (
    <div className="space-y-6">
      <DatasetForm mode="create" />
    </div>
  );
}
