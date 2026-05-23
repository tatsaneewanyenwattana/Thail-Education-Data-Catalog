"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
async function deleteDataset(id: string): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.delete(`/agency/datasets/${id}`);
  await Promise.resolve();
  void id;
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
    },
  });
}
