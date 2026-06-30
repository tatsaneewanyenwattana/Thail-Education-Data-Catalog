"use client";

import { useParams } from "next/navigation";
import DatasetForm from "@/components/dataset/DatasetForm";

export default function AdminEditDatasetPage() {
  const params = useParams<{ id: string }>();
  const datasetId = params.id;

  return <DatasetForm mode="edit" datasetId={datasetId} />;
}
