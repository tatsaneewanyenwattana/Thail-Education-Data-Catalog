"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  updateDatasetMock,
  type UploadDatasetMockResult,
} from "@/data/mockData";
// import apiClient from "@/services/api";

export type UpdateDatasetPayload = {
  id: string;
  formData: FormData;
};

async function updateDataset(
  payload: UpdateDatasetPayload
): Promise<UploadDatasetMockResult> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const res = await apiClient.patch(
  //   `/datasets/${payload.id}`,
  //   payload.formData,
  //   { headers: { "Content-Type": "multipart/form-data" } }
  // );
  // return res.data.data;
  await Promise.resolve();
  return updateDatasetMock(payload.id, payload.formData);
}

export function useUpdateDataset() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDataset,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
      router.push(`/${locale}/datasets/${variables.id}`);
    },
  });
}
