"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  uploadDatasetMock,
  type UploadDatasetMockResult,
} from "@/data/mockData";
// import apiClient from "@/services/api";

async function uploadDataset(
  formData: FormData
): Promise<UploadDatasetMockResult> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const res = await apiClient.post(
  //   "/datasets",
  //   formData,
  //   { headers: { "Content-Type": "multipart/form-data" } }
  // );
  // return res.data.data;
  await Promise.resolve();
  return uploadDatasetMock(formData);
}

export function useUploadDataset() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
      router.push(`/${locale}/datasets`);
    },
  });
}
